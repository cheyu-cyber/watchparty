export default {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_OAUTH_REDIRECT_HOSTNAME:
    import.meta.env.VITE_OAUTH_REDIRECT_HOSTNAME ?? "https://www.watchparty.me",
  // Upstream ships a hardcoded fallback pointing at watchparty.me's
  // production Firebase project so that `npm run dev` "just works"
  // against a real auth backend.  For our self-hosted fork that fallback
  // is actively harmful: it makes `firebaseConfig` truthy at all times,
  // which (a) attempts onAuthStateChanged against a project we don't own
  // (always returns null, no user is ever set) and (b) lets vite
  // dead-code-eliminate the else branch in index.tsx that synthesizes a
  // local user when Firebase is disabled — leaving all owner-gated
  // features (make-permanent, kick, password, vanity URL, …) locked.
  //
  // Strategy: only honor an explicit env var.  When `VITE_FIREBASE_CONFIG`
  // is unset (the self-hosted default), this becomes `""` → falsy →
  // the else branch in index.tsx is kept by vite → fakeUser is
  // synthesized → owner features unlock.
  VITE_FIREBASE_CONFIG: import.meta.env.VITE_FIREBASE_CONFIG ?? "",
  VITE_STRIPE_PUBLIC_KEY:
    import.meta.env.VITE_STRIPE_PUBLIC_KEY ??
    "pk_live_eVMbIifj5lnvgBleBCRaCv4E00aeXQkPxQ",
  VITE_FIREBASE_SIGNIN_METHODS: "facebook,google,email",
  NODE_ENV: import.meta.env.DEV ? "development" : "production",
};
