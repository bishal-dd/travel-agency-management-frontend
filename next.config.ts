import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Anything the browser sends to /backend/... is passed on to the Render backend.
  // The browser only ever talks to www.helpmaketravel.com, so it keeps the login cookie.
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination:
          "https://travel-agency-management-backend.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
