import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Experimental features (Next 16) ─────────────────────────────────────
  experimental: {
    // Server Actions already stable in Next 16, no flag needed
    // Keep PPR off until Supabase is wired (requires dynamic rendering)
    ppr: false,
  },

  // ── Security headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // ── TypeScript (keep strict in CI) ──────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
  // Note: eslint config moved to eslint.config.mjs in Next.js 16
};

export default nextConfig;
