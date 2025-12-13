import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone', // Deaktiviert, da es mit npm run start nicht kompatibel ist
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Prisma für Docker Runtime
  serverExternalPackages: ['@prisma/client', 'prisma', '@prisma/adapter-pg', 'pg'],
  
  // Webpack-Konfiguration für bessere Chunk-Verwaltung
  webpack: (config, { dev, isServer }) => {
    // Chunk-Loading-Probleme beheben
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
