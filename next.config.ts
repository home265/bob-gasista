// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { turbo: { rules: {} } },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    },
  ],
};

export default nextConfig;
