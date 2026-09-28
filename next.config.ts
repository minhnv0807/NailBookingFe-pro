import type { NextConfig } from "next";

// `npm run build` bakes these into the browser bundle; building without them
// would ship a booking page that talks to nothing.
if (process.env.npm_lifecycle_event === "build") {
  for (const key of ["NEXT_PUBLIC_VITECH_API_URL", "NEXT_PUBLIC_VITECH_SHOP_SLUG"]) {
    if (!process.env[key]) throw new Error(`${key} must be set when building`);
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
