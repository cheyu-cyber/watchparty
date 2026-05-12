import config from "../config.ts";
import admin from "firebase-admin";

if (config.FIREBASE_ADMIN_SDK_CONFIG) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(config.FIREBASE_ADMIN_SDK_CONFIG),
    ),
    databaseURL: config.FIREBASE_DATABASE_URL,
  });
}

export async function validateUserToken(uid: string, token: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    // Self-host mode: no Firebase Admin SDK configured, so we can't
    // cryptographically verify anything.  Accept the request as long
    // as the client supplied a uid.  This mirrors the per-socket
    // identity assignment in server/room.ts where socket.uid is set
    // to the persistent browser clientId — the same uid the client
    // sends here via req.query.uid.
    //
    // Trivially spoofable (anyone can pass any uid in the query
    // string), but that matches the self-host single-user threat
    // model where the only "user" is whoever has shell access to
    // this box.  Endpoints that mutate per-user state (listRooms,
    // deleteRoom, manageSub, linkAccount, metadata, …) then operate
    // on the room rows whose owner column matches that uid.
    if (!uid) {
      return undefined;
    }
    // Shape mirrors admin.auth().verifyIdToken()'s return: only the
    // .uid field is actually read by callers, so a minimal stub is
    // enough.  The `as unknown as ...` cast is required because the
    // real DecodedIdToken type has many required fields we don't have.
    return { uid } as unknown as Awaited<
      ReturnType<admin.auth.Auth["verifyIdToken"]>
    >;
  }
  if (!token) {
    return undefined;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (uid !== decoded.uid) {
      // Valid but for wrong user
      return undefined;
    }
    return decoded;
  } catch (e) {
    // Promise rejects if verification failed
    console.log(e);
    return undefined;
  }
}

export async function writeData(key: string, value: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return;
  }
  await admin.database().ref(key).set(value);
}

export async function getUserByEmail(email: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (e: any) {
    console.log(email, e.message);
  }
  return null;
}

export async function getUser(uid: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  return await admin.auth().getUser(uid);
}

export async function getUserEmail(uid: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  const user = await admin.auth().getUser(uid);
  return user.email;
}

export async function deleteUser(uid: string) {
  if (!config.FIREBASE_ADMIN_SDK_CONFIG) {
    return null;
  }
  return admin.auth().deleteUser(uid);
}
