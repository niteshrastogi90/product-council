/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['gray-matter'],
    // Ensure data files are included in Vercel serverless function bundles
    outputFileTracingIncludes: {
      '/api/council': ['./data/**/*.json'],
      '/api/search': ['./data/**/*.json'],
    },
  },
  // Allow reading transcript files from data directory
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig;
