/**
 * 脚本：下载完整的 Psalms, Proverbs, John 书卷（RV1960）
 * 用于支持书卷类别的完整西班牙语
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 书卷映射
const BOOKS_TO_DOWNLOAD = [
  { english: 'Psalms', spanish: 'Salmos' },
  { english: 'Proverbs', spanish: 'Proverbios' },
  { english: 'John', spanish: 'San Juan' }
];

// 从 GitHub 下载书卷 JSON
function downloadBook(spanishBookName) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/aruljohn/Reina-Valera/master/${encodeURIComponent(spanishBookName)}.json`;

    console.log(`  下载 URL: ${url}`);

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`下载失败 ${spanishBookName}: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`解析 JSON 失败 ${spanishBookName}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// 从书卷数据中提取所有经文到 map
function extractAllVerses(bookData, englishBookName) {
  const verses = {};
  let count = 0;

  if (!bookData.chapters) {
    console.error('  ❌ 书卷数据格式错误：缺少 chapters');
    return verses;
  }

  bookData.chapters.forEach(chapterData => {
    const chapter = chapterData.chapter;

    chapterData.verses.forEach(verseData => {
      const verse = verseData.verse;
      const text = verseData.text;
      const reference = `${englishBookName} ${chapter}:${verse}`;

      verses[reference] = text;
      count++;
    });
  });

  console.log(`  ✅ 提取了 ${count} 个经文`);
  return verses;
}

// 主函数
async function main() {
  console.log('🚀 开始下载完整书卷...\n');

  // 1. 读取现有的 rv1960-map.json
  const mapPath = path.join(__dirname, '../public/rv1960-map.json');
  let existingMap = {};

  try {
    const raw = fs.readFileSync(mapPath, 'utf8');
    existingMap = JSON.parse(raw);
    console.log(`📖 已加载现有数据: ${Object.keys(existingMap).length} 个经文\n`);
  } catch (e) {
    console.log('📖 未找到现有文件，将创建新文件\n');
  }

  // 2. 下载并提取完整书卷
  let totalAdded = 0;

  for (const book of BOOKS_TO_DOWNLOAD) {
    console.log(`📚 处理: ${book.spanish} (${book.english})`);

    try {
      const bookData = await downloadBook(book.spanish);
      const verses = extractAllVerses(bookData, book.english);

      // 合并到现有 map（不覆盖已有数据）
      let added = 0;
      Object.entries(verses).forEach(([ref, text]) => {
        if (!existingMap[ref]) {
          existingMap[ref] = text;
          added++;
        }
      });

      console.log(`  ➕ 新增了 ${added} 个经文\n`);
      totalAdded += added;

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`  ❌ 错误: ${error.message}\n`);
    }
  }

  // 3. 保存合并后的结果
  fs.writeFileSync(mapPath, JSON.stringify(existingMap, null, 2), 'utf8');

  console.log('='.repeat(60));
  console.log(`✅ 完成！`);
  console.log(`   原有: ${Object.keys(existingMap).length - totalAdded} 个经文`);
  console.log(`   新增: ${totalAdded} 个经文`);
  console.log(`   总计: ${Object.keys(existingMap).length} 个经文`);
  console.log(`   文件: ${mapPath}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
