import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const rootDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {
    root: rootDir,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
  outputFileTracingExcludes: {
    "/api/seed-images": [
      "./next.config.ts",
      "./.claude/**/*",
      "./.git/**/*",
      "./.next/**/*",
      "./.next-dev/**/*",
      "./.playwright-cli/**/*",
      "./WhatsApp Chat with Autolist Dev Team/**/*",
    ],
  },
  images: {
    unoptimized: true,
    qualities: [75, 95],
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
