import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Keep route output directory creation sequential on Windows builds.
    cpus: 1,
  },
};

export default nextConfig;
