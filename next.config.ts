import type { NextConfig } from "next";

// `npm run build` bakes these into the browser bundle; building without them
// would ship a booking page that talks to nothing.
if (process.env.npm_lifecycle_event === "build") {
  for (const key of ["NEXT_PUBLIC_VITECH_API_URL", "NEXT_PUBLIC_VITECH_SHOP_SLUG"]) {
    if (!process.env[key]) throw new Error(`${key} must be set when building`);
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    const toBooking = [
      "/register",
      "/login",
      "/my-bookings",
      "/verify-email",
      "/verify-phone",
      "/forgot-password",
      "/reset-password",
      "/booking/verify",
      "/payment/:path*",
      // Vi-Tech's dashboard builds https://{custom domain}/book/{slug}.
      "/book/:slug",
    ];
    const toDashboard = ["/admin", "/admin/:path*", "/staff", "/staff/:path*"];
    return [
      ...toBooking.map((source) => ({ source, destination: "/booking", permanent: false })),
      ...toDashboard.map((source) => ({
        source,
        destination: "https://app.vi-tech.uk/login",
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
