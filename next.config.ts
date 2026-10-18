import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Profiles were per Clerk user; the site now shows a single travel log.
  async redirects() {
    return [{ source: "/users/:path*", destination: "/", permanent: true }];
  },
};

export default nextConfig;
