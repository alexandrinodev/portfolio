import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.9'],
  outputFileTracingIncludes: {
    "/api/chat": [
      "./docs/alex_portfolio_knowledge_public.md",
      "./docs/alex_ai_system_prompt.md",
    ],
  },
};

export default nextConfig;
