/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig = {
  // Avoid corrupted/missing vendor-chunks for Supabase in dev + SSR routes
  experimental: {
    serverComponentsExternalPackages: [
      "@supabase/supabase-js",
      "ssh2-sftp-client",
      "ssh2",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/hero/:path*",
        destination: "/images/hero/:path*",
      },
    ];
  },
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
