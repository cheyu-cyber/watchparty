export default {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_OAUTH_REDIRECT_HOSTNAME:
    import.meta.env.VITE_OAUTH_REDIRECT_HOSTNAME ?? "https://www.watchparty.me",
  // Upstream's hardcoded fallback points at watchparty.me's production
  // Firebase project (`watchparty-273604`), which is *a stranger's*
  // project for our self-hosted fork.  Two harms:
  //   (1) any account a user creates lives in that stranger's project
  //   (2) the truthy fallback caused vite to dead-code-eliminate the
  //       `else` branch in src/index.tsx that synthesizes a local user
  //       when no real Firebase is configured.
  //
  // Empty default = self-host mode.  Real value can still be supplied
  // at build time via `VITE_FIREBASE_CONFIG=<json> npm run build` if a
  // future operator wants to wire up their own Firebase project.
  VITE_FIREBASE_CONFIG: import.meta.env.VITE_FIREBASE_CONFIG ?? "",
  VITE_STRIPE_PUBLIC_KEY:
    import.meta.env.VITE_STRIPE_PUBLIC_KEY ??
    "pk_live_eVMbIifj5lnvgBleBCRaCv4E00aeXQkPxQ",
  VITE_FIREBASE_SIGNIN_METHODS: "facebook,google,email",
  NODE_ENV: import.meta.env.DEV ? "development" : "production",
};
