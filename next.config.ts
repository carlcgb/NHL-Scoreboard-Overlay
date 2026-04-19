import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.nhle.com", pathname: "/**" },
      { protocol: "https", hostname: "www-league.nhl.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
