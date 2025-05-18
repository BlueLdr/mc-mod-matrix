import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  optimizePackageImports: ["@mui/*"],
  // transpilePackages: ["@mui/material", "@mui/icons-material"],
};

export default nextConfig;
