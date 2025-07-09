const backendApiUrl = process.env.BACKEND_API_URL || "http://localhost:3001";

export default {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*`, // Proxy to backend
      },
    ];
  },
};
