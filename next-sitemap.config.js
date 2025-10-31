/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://bibleverse-generator.org', // 你的主域名
    generateRobotsTxt: true,                     // 自动生成 robots.txt
    sitemapSize: 5000,
    changefreq: 'daily',                         // 建议搜索引擎每天爬取
    priority: 0.7,
    exclude: ['/server-sitemap.xml', '/icon.png', '/icon-*.png', '/apple-touch-icon.png'],  // 排除图标和不需要的文件
    robotsTxtOptions: {
      policies: [
        { userAgent: '*', allow: '/' },
      ],
    },
    // 自定义优先级
    transform: async (config, path) => {
      // 西班牙语主页高优先级
      if (path === '/es' || path === '/es/') {
        return {
          loc: path,
          changefreq: 'daily',
          priority: 1.0,
          lastmod: new Date().toISOString(),
        }
      }

      // 英文主页最高优先级
      if (path === '/' || path === '/en' || path === '/en/') {
        return {
          loc: path,
          changefreq: 'daily',
          priority: 1.0,
          lastmod: new Date().toISOString(),
        }
      }

      // 生成器页面高优先级（英文和西班牙语）
      if (path.includes('-bible-verses') || path.includes('pornography-prayer-points')) {
        return {
          loc: path,
          changefreq: 'daily',
          priority: 0.9,
          lastmod: new Date().toISOString(),
        }
      }

      // 其他页面默认优先级
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: new Date().toISOString(),
      }
    },
  };
  