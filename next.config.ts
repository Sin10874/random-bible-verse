import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect www to non-www (canonical domain)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.bibleverse-generator.org',
          },
        ],
        destination: 'https://bibleverse-generator.org/:path*',
        permanent: true, // 308 redirect
      },
    ];
  },
};

export default withNextIntl(nextConfig);
