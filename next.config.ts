import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@tensorflow/tfjs-node"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@tensorflow/tfjs-node": "commonjs @tensorflow/tfjs-node",
      });
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3002/api/:path*",
      },
    ];
  },
};

export default nextConfig;
