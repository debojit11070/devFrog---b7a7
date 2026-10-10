import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Avatars and logos are user-provided URLs, so any HTTPS host is allowed.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // Only the icons/components actually imported get bundled per route,
    // instead of pulling in the whole package graph.
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
