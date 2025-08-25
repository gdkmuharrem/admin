import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'api.muharremgedik.online',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
