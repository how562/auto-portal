/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid corrupted/missing vendor-chunks for Supabase in dev + SSR routes
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
};

export default nextConfig;
