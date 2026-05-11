import "@mantine/core/styles.css";
import "./index.css";

import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route } from "react-router-dom";

import { App } from "./components/App/App";
import { Home } from "./components/Home/Home";
import { Privacy, Terms, FAQ } from "./components/Pages/Pages";
import { TopBar } from "./components/TopBar/TopBar";
import { Footer } from "./components/Footer/Footer";
import firebase from "firebase/compat/app";
import "firebase/auth";
import { serverPath, softWhite } from "./utils/utils";
import { Create } from "./components/Create/Create";
import { Discord } from "./components/Discord/Discord";
import config from "./config";
import { DEFAULT_STATE, MetadataContext } from "./MetadataContext";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  /** Your theme override here */
  white: softWhite,
});

const Debug = lazy(() => import("./components/Debug/Debug"));

const firebaseConfig = config.VITE_FIREBASE_CONFIG;
if (firebaseConfig) {
  firebase.initializeApp(JSON.parse(firebaseConfig));
} else {
  // Self-host mode: no real Firebase project.  Initialize with stub
  // values so any unconditional ``firebase.auth()`` / ``firebase.app()``
  // call elsewhere in the React tree (or in a transitively imported
  // module) doesn't crash with "No Firebase App '[DEFAULT]' has been
  // created".  The default app exists, the auth singleton exists, and
  // any ``onAuthStateChanged`` listener fires once with ``null`` and
  // then stops — exactly what we want, since the synthesized fakeUser
  // below is the only user that should ever flow through React state.
  //
  // The values themselves are nonsense but syntactically valid; they
  // never reach the network because we never call signIn* anywhere
  // when ``firebaseConfig`` is empty (LoginModal/ProfileModal trigger
  // on user click, and the sign-in button is hidden whenever
  // ``user`` is truthy — which it always is in self-host mode).
  firebase.initializeApp({
    apiKey: "self-host-stub",
    authDomain: "localhost",
    projectId: "self-host-stub",
    appId: "1:0:web:0",
  });

  // Defensive cleanup: if the user previously ran against the upstream
  // hardcoded Firebase fallback (watchparty-273604), their browser
  // localStorage may still have ``firebase:authUser:*`` keys for that
  // project.  Those keys would otherwise persist forever and confuse
  // future debugging.  Harmless to remove — the stub app has a
  // different appId so Firebase wouldn't try to rehydrate them anyway.
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("firebase:")) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // SecurityError in private/incognito modes; ignore.
  }
}

// Redirect old-style URLs
if (window.location.hash && window.location.pathname === "/") {
  const hashRoomId = window.location.hash.substring(1);
  window.location.href = "/watch/" + hashRoomId;
}

class WatchParty extends React.Component {
  public state = DEFAULT_STATE;
  async componentDidMount() {
    if (firebaseConfig) {
      firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
        if (user) {
          // console.log(user);
          this.setState({ user });
          const token = await user.getIdToken();
          const response = await window.fetch(
            serverPath + `/metadata?uid=${user.uid}&token=${token}`,
          );
          const data = await response.json();
          this.setState({
            isSubscriber: data.isSubscriber,
            streamPath: data.streamPath,
            convertPath: data.convertPath,
            beta: data.beta,
          });
        }
      });
    } else {
      // Firebase isn't set up — single-user self-hosted mode.
      // Beyond enabling subscriber features, we also synthesize a
      // minimal user object so the UI doesn't disable owner-only
      // features (make-permanent toggle, room locks, kick, vanity URL,
      // etc.) on `!Boolean(user)` checks.
      //
      // The uid mirrors the browser's persistent localStorage clientId
      // — the same value the server now adopts as socket.uid when
      // Firebase isn't configured (see server/room.ts).  This keeps
      // client and server agreeing on identity without any real auth.
      const clientId =
        window.localStorage.getItem("watchparty-clientid") ?? "local-user";
      const fakeUser = {
        uid: clientId,
        displayName: null,
        email: null,
        photoURL: null,
        getIdToken: async () => "local",
      } as unknown as firebase.User;
      this.setState({
        user: fakeUser,
        isSubscriber: true,
      });
    }
  }
  render() {
    return (
      // <React.StrictMode>
      <MantineProvider theme={theme} forceColorScheme="dark">
        <MetadataContext.Provider value={this.state}>
          <BrowserRouter>
            <Route
              path="/"
              exact
              render={(props) => {
                return (
                  <React.Fragment>
                    <TopBar hideNewRoom />
                    <Home />
                    <Footer />
                  </React.Fragment>
                );
              }}
            />
            <Route
              path="/create"
              exact
              render={() => {
                return <Create />;
              }}
            />
            <Route
              path="/watch/:roomId"
              exact
              render={(props) => {
                return <App urlRoomId={props.match.params.roomId} />;
              }}
            />
            <Route
              path="/r/:vanity"
              exact
              render={(props) => {
                return <App vanity={props.match.params.vanity} />;
              }}
            />
            <Route path="/terms">
              <TopBar />
              <Terms />
              <Footer />
            </Route>
            <Route path="/privacy">
              <TopBar />
              <Privacy />
              <Footer />
            </Route>
            <Route path="/faq">
              <TopBar />
              <FAQ />
              <Footer />
            </Route>
            <Route path="/discord/auth" exact>
              <Discord />
            </Route>
            <Route path="/debug">
              <TopBar />
              <Suspense fallback={null}>
                <Debug />
              </Suspense>
              <Footer />
            </Route>
          </BrowserRouter>
        </MetadataContext.Provider>
      </MantineProvider>
      // </React.StrictMode>
    );
  }
}
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<WatchParty />);
