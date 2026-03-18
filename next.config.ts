import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8abb21a539134ef1a2bf81b37af13090.r2.dev",
        pathname: "/listings/**",
      },
      {
        protocol: "https",
        hostname: "pub-8abb21a539134ef1a2bf81b37af13090.r2.dev",
        pathname: "/dealers/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "autolist.com",
      },
      {
        protocol: "https",
        hostname: "www.autolist.com",
      },
    ],
  },
};

export default nextConfig;
