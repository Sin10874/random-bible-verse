/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://bibleverse-generator.org', // 你的主域名
    generateRobotsTxt: true,                     // 自动生成 robots.txt
    sitemapSize: 5000,
    changefreq: 'daily',                         // 建议搜索引擎每天爬取
    priority: 0.7,
    exclude: ['/server-sitemap.xml'],            // 如果未来添加自定义 sitemap 可用
    additionalPaths: async (config) => [
      {
        loc: '/prayer-for-purity',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
    ],
    robotsTxtOptions: {
      policies: [
        { userAgent: '*', allow: '/' },
      ],
    },
  };
  