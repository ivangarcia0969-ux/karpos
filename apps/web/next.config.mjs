/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    workerThreads: false,
    cpus: 1,
  },
  transpilePackages: ['@karpos/ui', '@karpos/sdk', '@karpos/types', '@karpos/i18n'],
  i18n: undefined,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  webpack: (config) => {
    // TS source in workspace packages uses ESM-style `.js` import suffixes that
    // webpack cannot resolve out of the box. Map them to the .ts/.tsx files.
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
};
export default nextConfig;
