import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Abaikan TypeScript error saat build
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Abaikan error dari ESLint saat build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Konfigurasi tambahan webpack
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
