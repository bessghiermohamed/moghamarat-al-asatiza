import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/moghamarat-al-asatiza",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
