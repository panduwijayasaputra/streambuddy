/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: [],
  },

  // Development settings
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: "bottom-right",
  },

  // Image optimization
  images: {
    domains: ["localhost", "streambuddy.com", "cdn.streambuddy.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Webpack configuration (only for non-turbo builds)
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack config when not using turbo
    if (!process.env.TURBOPACK) {
      // Optimize for development
      if (dev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }

      // Handle SVG imports
      config.module.rules.push({
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      });
    }

    return config;
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxy (if needed)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },

  // Output configuration
  output: "standalone",

  // TypeScript configuration
  typescript: {
    // Don't fail build on TypeScript errors during development
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },

  // ESLint configuration
  eslint: {
    // Don't fail build on ESLint errors during development
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
};

module.exports = nextConfig;
