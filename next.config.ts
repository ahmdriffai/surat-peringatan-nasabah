import type { NextConfig } from "next";

const r2Hostname = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: r2Hostname
      ? [{ protocol: "https", hostname: r2Hostname }]
      : [],
  },
  experimental: {
    serverActions: {
      // Arsip PDF maksimal 20 MB (lihat src/lib/upload.ts), kasih headroom.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
