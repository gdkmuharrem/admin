import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'], // Buraya izin vermek istediğin hostları ekle
  },
};

export default nextConfig;
