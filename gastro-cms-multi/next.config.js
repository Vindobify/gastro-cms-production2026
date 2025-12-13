/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Standard Build - standalone hat Probleme mit statischen Assets
  // output: 'standalone',
  
  // Statische Assets korrekt bereitstellen
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Trailing slash für bessere Asset-Erkennung
  trailingSlash: false,
  
  // Improve HTML formatting in development
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Prisma für Docker Runtime
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
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
  
  experimental: {
    serverActions: {
      // Dynamische Domain-Erkennung über Umgebungsvariable
      // Format: "https://domain1.com,https://domain2.com,http://localhost:3000"
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
        'http://localhost:3000', // Fallback für Development
        'https://gastro-cms.at', // Produktions-Domain
      ],
    },
    // Disable automatic prefetching to prevent DOM errors
    linkNoTouchStart: true,
  },

  // Bilder-Optimierung für Docker
  images: {
    unoptimized: false, // Docker kann Bilder optimieren
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Temporär deaktiviert für Debugging
          // { 
          //   key: 'Content-Security-Policy', 
          //   value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; img-src 'self' data: https: http: https://www.google-analytics.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss: ws: https://www.google-analytics.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';" 
          // },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/(.*)\\.css',
        headers: [
          { key: 'Content-Type', value: 'text/css; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain' },
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/admin', destination: '/dashboard', permanent: true },
    ];
  },
};

module.exports = nextConfig;
