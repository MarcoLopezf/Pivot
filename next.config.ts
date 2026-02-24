import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — disallow embedding in iframes
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information sent to other origins
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the app does not use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Enable DNS prefetch for performance while limiting info leakage
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Content Security Policy — report-only mode (logs violations, does not block)
  // Move to Content-Security-Policy once violations are reviewed in production
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      // Next.js App Router requires unsafe-inline for hydration scripts
      "script-src 'self' 'unsafe-inline'",
      // Tailwind and shadcn/ui use inline styles
      "style-src 'self' 'unsafe-inline'",
      // YouTube thumbnails + data URIs for base64 images
      "img-src 'self' https://i.ytimg.com data: blob:",
      // Supabase REST + Realtime (WebSocket)
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "font-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      // Restrict base URL to prevent base tag hijacking
      "base-uri 'self'",
      // Restrict form submissions to same origin
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 300, // 5 minutes (default is 30 seconds)
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
