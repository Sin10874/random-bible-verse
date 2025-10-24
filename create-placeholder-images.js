#!/usr/bin/env node

/**
 * 创建占位符 SVG 图片
 * 每个图片都有主题相关的渐变色和标题
 */

const fs = require('fs');
const path = require('path');

// 图片配置：主题、渐变色、标题
const images = [
  {
    name: 'love',
    title: 'Bible Verses About Love',
    colors: ['#FF6B6B', '#C44569'], // 温暖的红色/粉色
    emoji: '❤️'
  },
  {
    name: 'hope',
    title: 'Bible Verses About Hope',
    colors: ['#FFA62B', '#EA5455'], // 日出橙色
    emoji: '🌅'
  },
  {
    name: 'strength',
    title: 'Bible Verses About Strength',
    colors: ['#4A5568', '#718096'], // 山峰灰色
    emoji: '⛰️'
  },
  {
    name: 'peace',
    title: 'Bible Verses About Peace',
    colors: ['#667EEA', '#764BA2'], // 平静蓝紫色
    emoji: '🕊️'
  },
  {
    name: 'faith',
    title: 'Bible Verses About Faith',
    colors: ['#1A365D', '#2C5282'], // 深蓝星空色
    emoji: '✨'
  },
  {
    name: 'grief',
    title: 'Bible Verses About Grief',
    colors: ['#4A5568', '#718096'], // 柔和灰色
    emoji: '🌧️'
  },
  {
    name: 'psalms',
    title: 'Bible Verses from Psalms',
    colors: ['#9F7AEA', '#805AD5'], // 敬拜紫色
    emoji: '🙌'
  },
  {
    name: 'proverbs',
    title: 'Bible Verses from Proverbs',
    colors: ['#975A16', '#744210'], // 古书棕色
    emoji: '📖'
  },
  {
    name: 'john',
    title: 'Bible Verses from John',
    colors: ['#ECC94B', '#D69E2E'], // 光芒金色
    emoji: '💡'
  },
  {
    name: 'prayer',
    title: 'Bible Verses About Prayer',
    colors: ['#805AD5', '#6B46C1'], // 祷告紫色
    emoji: '🙏'
  },
  {
    name: 'encouragement',
    title: 'Bible Verses About Encouragement',
    colors: ['#38B2AC', '#319795'], // 胜利青色
    emoji: '🎯'
  },
  {
    name: 'comfort',
    title: 'Bible Verses About Comfort',
    colors: ['#ED8936', '#DD6B20'], // 温暖橙色
    emoji: '🔥'
  },
  {
    name: 'thanksgiving',
    title: 'Bible Verses About Thanksgiving',
    colors: ['#DD6B20', '#C05621'], // 秋天橙棕色
    emoji: '🍂'
  },
];

// 创建目录
const outputDir = path.join(__dirname, 'public', 'generators');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 创建占位符图片...\n');

// 创建单个 SVG 图片
function createSVG(imageInfo) {
  const { name, title, colors, emoji } = imageInfo;
  const [color1, color2] = colors;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 渐变背景 -->
  <rect width="1600" height="900" fill="url(#grad_${name})" />

  <!-- 半透明叠加层 -->
  <rect width="1600" height="900" fill="rgba(0,0,0,0.3)" />

  <!-- Emoji 图标 -->
  <text x="800" y="380" font-size="120" text-anchor="middle" fill="rgba(255,255,255,0.9)">
    ${emoji}
  </text>

  <!-- 标题文本 -->
  <text x="800" y="520"
        font-family="Arial, sans-serif"
        font-size="48"
        font-weight="bold"
        text-anchor="middle"
        fill="white">
    ${title}
  </text>

  <!-- 临时占位符提示 -->
  <text x="800" y="580"
        font-family="Arial, sans-serif"
        font-size="20"
        text-anchor="middle"
        fill="rgba(255,255,255,0.7)">
    Temporary Placeholder - Replace with Unsplash Photo
  </text>
</svg>`;

  return svg;
}

// 生成所有图片
let successCount = 0;
images.forEach((imageInfo) => {
  const { name } = imageInfo;
  const filepath = path.join(outputDir, `${name}.svg`);

  try {
    const svgContent = createSVG(imageInfo);
    fs.writeFileSync(filepath, svgContent, 'utf8');
    const stats = fs.statSync(filepath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`✅ ${name}.svg - ${sizeKB}KB`);
    successCount++;
  } catch (error) {
    console.log(`❌ ${name}.svg - 失败: ${error.message}`);
  }
});

console.log(`\n🎉 完成! 成功创建 ${successCount}/13 个占位符图片\n`);
console.log('📁 位置: public/generators/\n');
console.log('💡 这些是临时占位符，显示效果如下：');
console.log('   - 每个图片都有主题相关的渐变色背景');
console.log('   - 显示相应的 emoji 图标和标题');
console.log('   - 文件大小 < 2KB，加载非常快\n');
console.log('🔄 要替换为真实的 Unsplash 照片：');
console.log('   1. 在本地机器上运行: node download-unsplash-images.js');
console.log('   2. 或者按照 PHOTO_DOWNLOAD_GUIDE.md 手动下载\n');
console.log('🚀 现在可以运行: npm run dev 查看效果\n');
