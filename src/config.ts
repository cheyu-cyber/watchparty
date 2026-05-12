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
  // Maximum video bitrate per peer for screen / file share in P2P
  // (Free) mode, in kbps.  Default 4000 = 4 Mbps, sized for typical
  // residential upload (25 Mbps) with a comfortable 3–4 viewer
  // budget.  Combined with the VP9 codec preference below this
  // produces visibly sharper output than upstream's auto-negotiated
  // VP8 / ~2 Mbps default.
  //
  // Trade-off: every viewer consumes this much of your *upload*.
  // Pick a value such that
  //   VITE_MAX_VIDEO_BITRATE_KBPS × <max viewers> < <upload speed kbps>
  // Examples for common upload speeds:
  //   25 Mbps up, 3 viewers   → 4000 (the default) is fine
  //   25 Mbps up, 5 viewers   → drop to 3000
  //   100 Mbps up, 5 viewers  → can push to 12000
  // Override at build time:
  //   VITE_MAX_VIDEO_BITRATE_KBPS=12000 docker compose build app --no-cache
  VITE_MAX_VIDEO_BITRATE_KBPS: Number(
    import.meta.env.VITE_MAX_VIDEO_BITRATE_KBPS ?? 4000,
  ),
  NODE_ENV: import.meta.env.DEV ? "development" : "production",
};
