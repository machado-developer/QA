/** @type {import('next').NextConfig} */
const nextConfig = {
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb', // ou '20mb', '50mb', conforme necessidade
    },
  },
};

module.exports = nextConfig;
