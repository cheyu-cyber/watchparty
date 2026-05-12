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
  // (Free) mode, in kbps.  Default 3600 = 3.6 Mbps, dialled down
  // from 4000 to leave a bit more headroom on tight residential
  // upstreams.  Combined with the VP9 codec preference below this
  // still produces visibly sharper output than upstream's
  // auto-negotiated VP8 / ~2 Mbps default — VP9 gives roughly the
  // same perceived quality at 70 % of the bitrate.
  //
  // Trade-off: every viewer consumes this much of your *upload*.
  // Pick a value such that
  //   VITE_MAX_VIDEO_BITRATE_KBPS × <max viewers> < <upload speed kbps>
  // Examples for common upload speeds:
  //   25 Mbps up, 3 viewers   → 3600 (the default) is fine
  //   25 Mbps up, 5 viewers   → drop to 2500
  //   100 Mbps up, 5 viewers  → can push to 12000
  // Override at build time:
  //   VITE_MAX_VIDEO_BITRATE_KBPS=12000 docker compose build app --no-cache
  VITE_MAX_VIDEO_BITRATE_KBPS: Number(
    import.meta.env.VITE_MAX_VIDEO_BITRATE_KBPS ?? 3200,
  ),
  // Opus audio bitrate for screen / file share, in kbps.  Upstream
  // hardcoded 510 kbps (effectively lossless overkill) for both the
  // stereo and 5.1 paths.  Opus is so efficient that:
  //   * 128 kbps stereo  — ABX-indistinguishable from source on music;
  //                        matches YouTube Premium / Spotify "very high"
  //   * 384 kbps multiopus (5.1, 6 channels) — same per-channel budget
  //                        as stereo at 128, surround stays clean
  // Saves ~382 kbps per viewer on stereo content vs the old 510 kbps,
  // which together with the 3.2 Mbps video ceiling lets us fit roughly
  // one extra viewer per 4 Mbps of upload headroom.
  //
  // Override at build time:
  //   VITE_AUDIO_BITRATE_KBPS=192 docker compose build app --no-cache
  VITE_AUDIO_BITRATE_KBPS: Number(
    import.meta.env.VITE_AUDIO_BITRATE_KBPS ?? 128,
  ),
  VITE_MULTIOPUS_BITRATE_KBPS: Number(
    import.meta.env.VITE_MULTIOPUS_BITRATE_KBPS ?? 384,
  ),
  NODE_ENV: import.meta.env.DEV ? "development" : "production",
};
