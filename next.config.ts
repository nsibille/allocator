import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer doit rester côté serveur (route handlers PDF)
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
