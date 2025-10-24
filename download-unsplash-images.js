#!/usr/bin/env node

/**
 * 从 Unsplash 下载图片的 Node.js 脚本
 * 使用 Unsplash API 或直接 URL
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 精选的高质量 Unsplash 图片 ID
const images = [
  { name: 'love', id: '1518199266791-a4c1ab8fe879', keywords: 'romantic sunset couple' },
  { name: 'hope', id: '1470252649378-9c29740c9fa8', keywords: 'sunrise mountain hope' },
  { name: 'strength', id: '1506905925346-21bda4d32df4', keywords: 'mountain peak strength' },
  { name: 'peace', id: '1506905925346-21bda4d32df4', keywords: 'calm lake peaceful' },
  { name: 'faith', id: '1419242902214-272b3f66ee7a', keywords: 'starry sky faith' },
  { name: 'grief', id: '1428908728789-d2de25dbd4e2', keywords: 'rain window grief' },
  { name: 'psalms', id: '1483736762161-1d107f3c78e1', keywords: 'worship hands praise' },
  { name: 'proverbs', id: '1481627834876-b7833e8f5570', keywords: 'old books wisdom' },
  { name: 'john', id: '1501594907352-04cda38ebc29', keywords: 'divine light rays' },
  { name: 'prayer', id: '1484480974693-6ca0a78fb36b', keywords: 'praying hands prayer' },
  { name: 'encouragement', id: '1506905925346-21bda4d32df4', keywords: 'mountain top victory' },
  { name: 'comfort', id: '1513694203232-719401b91226', keywords: 'cozy fireplace comfort' },
  { name: 'thanksgiving', id: '1507925921958-8a62f3d1a50d', keywords: 'harvest thanksgiving autumn' },
];

// 创建目录
const outputDir = path.join(__dirname, 'public', 'generators');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 开始下载 Unsplash 图片...\n');

// 下载单个图片
function downloadImage(imageInfo, index) {
  return new Promise((resolve, reject) => {
    const { name, id, keywords } = imageInfo;
    const filename = `${name}.jpg`;
    const filepath = path.join(outputDir, filename);

    // Unsplash 图片 URL (1600x900, 优化质量)
    const url = `https://images.unsplash.com/photo-${id}?w=1600&h=900&fit=crop&q=80`;

    console.log(`📥 [${index + 1}/13] 下载 ${name} (${keywords})...`);

    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filepath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`   ✅ 成功! 文件大小: ${sizeKB}KB\n`);
          resolve({ name, sizeKB, success: true });
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // 处理重定向
        const redirectUrl = response.headers.location;
        https.get(redirectUrl, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            const stats = fs.statSync(filepath);
            const sizeKB = Math.round(stats.size / 1024);
            console.log(`   ✅ 成功! 文件大小: ${sizeKB}KB\n`);
            resolve({ name, sizeKB, success: true });
          });
        }).on('error', (err) => {
          fs.unlink(filepath, () => {});
          console.log(`   ❌ 失败: ${err.message}\n`);
          reject(err);
        });
      } else {
        fs.unlink(filepath, () => {});
        console.log(`   ❌ 失败: HTTP ${response.statusCode}\n`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.log(`   ❌ 失败: ${err.message}\n`);
      reject(err);
    });
  });
}

// 顺序下载所有图片
async function downloadAllImages() {
  const results = [];

  for (let i = 0; i < images.length; i++) {
    try {
      const result = await downloadImage(images[i], i);
      results.push(result);
      // 添加短暂延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ name: images[i].name, success: false });
    }
  }

  console.log('\n🎉 下载完成!\n');
  console.log('📊 下载统计:');
  const successful = results.filter(r => r.success).length;
  console.log(`   ✅ 成功: ${successful}/13`);
  console.log(`   ❌ 失败: ${13 - successful}/13\n`);

  // 检查需要压缩的图片
  const needCompression = results.filter(r => r.success && r.sizeKB > 500);
  if (needCompression.length > 0) {
    console.log('⚠️  以下图片超过 500KB，建议压缩:');
    needCompression.forEach(r => {
      console.log(`   - ${r.name}.jpg (${r.sizeKB}KB)`);
    });
    console.log('\n💡 运行压缩脚本: ./compress-images.sh\n');
  } else {
    console.log('✅ 所有图片大小都符合要求 (< 500KB)\n');
  }

  console.log('📁 图片位置: public/generators/\n');
  console.log('🚀 现在可以运行: npm run dev 查看效果\n');
}

// 开始下载
downloadAllImages().catch(error => {
  console.error('❌ 下载过程出错:', error);
  process.exit(1);
});
