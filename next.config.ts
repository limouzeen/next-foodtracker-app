import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gwdgpwkdaheeirbuxzgi.supabase.co",
        pathname: "/storage/v1/object/public/user_bk/**",
      },
      {
        protocol: "https",
        hostname: "gwdgpwkdaheeirbuxzgi.supabase.co",
        pathname: "/storage/v1/object/public/food_bk/**",
      },
    ],
  },
};

export default nextConfig;
