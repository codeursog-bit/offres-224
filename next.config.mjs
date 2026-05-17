/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
};

export default nextConfig;