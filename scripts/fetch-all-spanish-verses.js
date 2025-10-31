/**
 * 脚本：批量从 GitHub 下载所有需要的 RV1960 经文
 * 数据源：https://github.com/aruljohn/Reina-Valera
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 书卷名称映射：英文 -> 西班牙语
const BOOK_NAME_MAP = {
  // 旧约
  'Genesis': 'Génesis',
  'Exodus': 'Éxodo',
  'Leviticus': 'Levítico',
  'Numbers': 'Números',
  'Deuteronomy': 'Deuteronomio',
  'Joshua': 'Josué',
  'Judges': 'Jueces',
  'Ruth': 'Rut',
  '1 Samuel': '1 Samuel',
  '2 Samuel': '2 Samuel',
  '1 Kings': '1 Reyes',
  '2 Kings': '2 Reyes',
  '1 Chronicles': '1 Crónicas',
  '2 Chronicles': '2 Crónicas',
  'Ezra': 'Esdras',
  'Nehemiah': 'Nehemías',
  'Esther': 'Ester',
  'Job': 'Job',
  'Psalms': 'Salmos',
  'Proverbs': 'Proverbios',
  'Ecclesiastes': 'Eclesiástes',
  "Solomon's Song": 'Cantares',
  'Isaiah': 'Isaías',
  'Jeremiah': 'Jeremías',
  'Lamentations': 'Lamentaciones',
  'Ezekiel': 'Ezequiel',
  'Daniel': 'Daniel',
  'Hosea': 'Oseas',
  'Joel': 'Joel',
  'Amos': 'Amós',
  'Obadiah': 'Abdías',
  'Jonah': 'Jonás',
  'Micah': 'Miqueas',
  'Nahum': 'Nahúm',
  'Habakkuk': 'Habacuc',
  'Zephaniah': 'Sofonías',
  'Haggai': 'Hageo',
  'Zechariah': 'Zacarías',
  'Malachi': 'Malaquías',

  // 新约
  'Matthew': 'San Mateo',
  'Mark': 'San Márcos',
  'Luke': 'San Lúcas',
  'John': 'San Juan',
  'Acts': 'Los Hechos',
  'Romans': 'Romanos',
  '1 Corinthians': '1 Corintios',
  '2 Corinthians': '2 Corintios',
  'Galatians': 'Gálatas',
  'Ephesians': 'Efesios',
  'Philippians': 'Filipenses',
  'Colossians': 'Colosenses',
  '1 Thessalonians': '1 Tesalonicenses',
  '2 Thessalonians': '2 Tesalonicenses',
  '1 Timothy': '1 Timoteo',
  '2 Timothy': '2 Timoteo',
  'Titus': 'Tito',
  'Philemon': 'Filemón',
  'Hebrews': 'Hebreos',
  'James': 'Santiago',
  '1 Peter': '1 San Pedro',
  '2 Peter': '2 San Pedro',
  '1 John': '1 San Juan',
  '2 John': '2 San Juan',
  '3 John': '3 San Juan',
  'Jude': 'Judas',
  'Revelation': 'Revelación'
};

// 解析经文引用 "John 3:16" -> {book: "John", chapter: 3, verse: 16}
function parseReference(ref) {
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) {
    console.error(`无法解析引用: ${ref}`);
    return null;
  }
  return {
    book: match[1],
    chapter: parseInt(match[2]),
    verse: parseInt(match[3])
  };
}

// 从 GitHub 下载书卷 JSON
function downloadBook(spanishBookName) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/aruljohn/Reina-Valera/master/${encodeURIComponent(spanishBookName)}.json`;

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

// 从书卷 JSON 中提取经文文本
function extractVerse(bookData, chapter, verse) {
  if (!bookData.chapters) {
    console.error('书卷数据格式错误：缺少 chapters');
    return null;
  }

  const chapterData = bookData.chapters.find(c => c.chapter === chapter);
  if (!chapterData) {
    console.error(`找不到章节 ${chapter}`);
    return null;
  }

  const verseData = chapterData.verses.find(v => v.verse === verse);
  if (!verseData) {
    console.error(`找不到经节 ${chapter}:${verse}`);
    return null;
  }

  return verseData.text;
}

// 收集所有需要的经文引用
function collectNeededVerses() {
  const categoriesPath = path.join(__dirname, '../public/verse-categories.json');
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

  const needed = new Set();

  // 收集主题类的经文
  Object.values(categories).forEach(cat => {
    if (cat.verses) {
      cat.verses.forEach(v => needed.add(v));
    }
  });

  console.log(`需要获取 ${needed.size} 个经文引用`);
  return Array.from(needed);
}

// 主函数
async function main() {
  console.log('🚀 开始批量下载 RV1960 经文...\n');

  // 1. 收集需要的经文
  const neededRefs = collectNeededVerses();

  // 2. 按书卷分组
  const bookGroups = {};
  neededRefs.forEach(ref => {
    const parsed = parseReference(ref);
    if (!parsed) return;

    if (!bookGroups[parsed.book]) {
      bookGroups[parsed.book] = [];
    }
    bookGroups[parsed.book].push({ ref, ...parsed });
  });

  console.log(`需要下载 ${Object.keys(bookGroups).length} 本书卷\n`);

  // 3. 下载并提取经文
  const rv1960Map = {};
  let successCount = 0;
  let failCount = 0;

  for (const [englishBook, verses] of Object.entries(bookGroups)) {
    const spanishBook = BOOK_NAME_MAP[englishBook];

    if (!spanishBook) {
      console.error(`❌ 找不到书卷映射: ${englishBook}`);
      failCount += verses.length;
      continue;
    }

    console.log(`📖 下载: ${spanishBook} (${verses.length} 个经文)`);

    try {
      const bookData = await downloadBook(spanishBook);

      verses.forEach(({ ref, chapter, verse }) => {
        const text = extractVerse(bookData, chapter, verse);
        if (text) {
          rv1960Map[ref] = text;
          successCount++;
        } else {
          console.error(`   ⚠️  未找到: ${ref}`);
          failCount++;
        }
      });

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`   ❌ 错误: ${error.message}`);
      failCount += verses.length;
    }
  }

  // 4. 保存结果
  const outputPath = path.join(__dirname, '../public/rv1960-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(rv1960Map, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 完成！成功: ${successCount}, 失败: ${failCount}`);
  console.log(`📁 已保存到: ${outputPath}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
