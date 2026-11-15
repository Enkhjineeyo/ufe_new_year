import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Гаднын URL-аас зураг ашиглах бол домэйнээ энд нэмнэ.
    remotePatterns: [
      // { protocol: "https", hostname: "example.com" },
    ],
  },
};

export default nextConfig;
