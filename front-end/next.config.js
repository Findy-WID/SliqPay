/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // removed to enable SSR & middleware for auth
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
