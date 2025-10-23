#!/usr/bin/env node

/**
 * 测试脚本：验证 Trending Generators 功能
 *
 * 运行方式：node test-generators.js
 */

const fs = require('fs');
const path = require('path');

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logSuccess(message) {
  log('✅ ' + message, 'green');
}

function logError(message) {
  log('❌ ' + message, 'red');
}

function logWarning(message) {
  log('⚠️  ' + message, 'yellow');
}

function logInfo(message) {
  log('ℹ️  ' + message, 'cyan');
}

function logSection(message) {
  log('\n' + '='.repeat(60), 'bold');
  log(message, 'bold');
  log('='.repeat(60), 'bold');
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    logSuccess(description);
    return true;
  } catch (error) {
    failedTests++;
    logError(description);
    log('   ' + error.message, 'red');
    return false;
  }
}

function warn(message) {
  warnings++;
  logWarning(message);
}

// ============================================================
// 测试 1: 验证数据文件存在
// ============================================================
logSection('测试 1: 验证数据文件');

const verseCategoriesPath = path.join(__dirname, 'public', 'verse-categories.json');
const kjvMapPath = path.join(__dirname, 'public', 'kjv-map.json');
const generatorsPath = path.join(__dirname, 'app', 'data', 'generators.ts');

test('verse-categories.json 文件存在', () => {
  if (!fs.existsSync(verseCategoriesPath)) {
    throw new Error('文件不存在: ' + verseCategoriesPath);
  }
});

test('kjv-map.json 文件存在', () => {
  if (!fs.existsSync(kjvMapPath)) {
    throw new Error('文件不存在: ' + kjvMapPath);
  }
});

test('generators.ts 文件存在', () => {
  if (!fs.existsSync(generatorsPath)) {
    throw new Error('文件不存在: ' + generatorsPath);
  }
});

// ============================================================
// 测试 2: 加载和验证 JSON 数据
// ============================================================
logSection('测试 2: 验证 JSON 数据格式');

let verseCategories;
let kjvMap;

test('verse-categories.json 可以解析', () => {
  const raw = fs.readFileSync(verseCategoriesPath, 'utf8');
  verseCategories = JSON.parse(raw);
});

test('kjv-map.json 可以解析', () => {
  const raw = fs.readFileSync(kjvMapPath, 'utf8');
  kjvMap = JSON.parse(raw);
});

// ============================================================
// 测试 3: 验证类别数据
// ============================================================
logSection('测试 3: 验证 13 个类别配置');

const expectedCategories = [
  'love', 'hope', 'strength', 'peace', 'faith', 'grief',
  'psalms', 'proverbs', 'john',
  'prayer', 'encouragement', 'comfort', 'thanksgiving'
];

test('所有 13 个类别都存在', () => {
  const categories = Object.keys(verseCategories);
  const missing = expectedCategories.filter(cat => !categories.includes(cat));
  if (missing.length > 0) {
    throw new Error('缺少类别: ' + missing.join(', '));
  }
});

test('没有多余的类别', () => {
  const categories = Object.keys(verseCategories);
  const extra = categories.filter(cat => !expectedCategories.includes(cat));
  if (extra.length > 0) {
    throw new Error('多余的类别: ' + extra.join(', '));
  }
});

// ============================================================
// 测试 4: 验证每个类别的数据结构
// ============================================================
logSection('测试 4: 验证类别数据结构');

expectedCategories.forEach(category => {
  test(`${category} - 有 name 字段`, () => {
    if (!verseCategories[category].name) {
      throw new Error(`缺少 name 字段`);
    }
  });

  test(`${category} - 有 description 字段`, () => {
    if (!verseCategories[category].description) {
      throw new Error(`缺少 description 字段`);
    }
  });

  test(`${category} - 有 verses 或 bookFilter`, () => {
    const hasVerses = verseCategories[category].verses && verseCategories[category].verses.length > 0;
    const hasBookFilter = verseCategories[category].bookFilter;
    if (!hasVerses && !hasBookFilter) {
      throw new Error(`既没有 verses 也没有 bookFilter`);
    }
  });
});

// ============================================================
// 测试 5: 验证经文引用的有效性
// ============================================================
logSection('测试 5: 验证经文引用');

const kjvKeys = Object.keys(kjvMap);
logInfo(`KJV 数据库包含 ${kjvKeys.length} 节经文`);

expectedCategories.forEach(category => {
  const catData = verseCategories[category];

  // 对于有 verses 列表的类别
  if (catData.verses && catData.verses.length > 0) {
    test(`${category} - 经文引用有效 (${catData.verses.length} 节)`, () => {
      const invalidRefs = [];
      catData.verses.forEach(ref => {
        if (!kjvMap[ref]) {
          invalidRefs.push(ref);
        }
      });
      if (invalidRefs.length > 0) {
        throw new Error(`无效的经文引用: ${invalidRefs.slice(0, 5).join(', ')}${invalidRefs.length > 5 ? '...' : ''}`);
      }
    });
  }

  // 对于有 bookFilter 的类别
  if (catData.bookFilter) {
    test(`${category} - bookFilter 有效`, () => {
      const bookName = catData.bookFilter;
      const matchingVerses = kjvKeys.filter(key => {
        if (!key.startsWith(bookName + ' ')) return false;

        // 检查排除列表
        if (catData.bookExclude) {
          for (const ex of catData.bookExclude) {
            if (key.startsWith(ex + ' ')) return false;
          }
        }
        return true;
      });

      if (matchingVerses.length === 0) {
        throw new Error(`bookFilter "${bookName}" 没有匹配任何经文`);
      }

      logInfo(`   → 找到 ${matchingVerses.length} 节 ${bookName} 经文`);
    });
  }
});

// ============================================================
// 测试 6: 验证经文内容质量
// ============================================================
logSection('测试 6: 验证经文内容质量');

// 测试主题类别的经文数量
const themeCategories = ['love', 'hope', 'strength', 'peace', 'faith', 'grief',
                          'prayer', 'encouragement', 'comfort', 'thanksgiving'];

themeCategories.forEach(category => {
  const verseCount = verseCategories[category].verses.length;

  test(`${category} - 有足够的经文 (>= 20)`, () => {
    if (verseCount < 20) {
      throw new Error(`只有 ${verseCount} 节经文，建议至少 20 节`);
    }
  });

  if (verseCount < 25) {
    warn(`${category} 只有 ${verseCount} 节经文，建议增加到 25+ 节以提供更多样性`);
  }
});

// ============================================================
// 测试 7: 测试 API 过滤逻辑
// ============================================================
logSection('测试 7: 模拟 API 过滤逻辑');

function getKeysForCategory(category) {
  if (!category) return kjvKeys;

  const catData = verseCategories[category];
  if (!catData) return kjvKeys;

  if (catData.verses && catData.verses.length > 0) {
    return catData.verses;
  }

  if (catData.bookFilter) {
    const bookName = catData.bookFilter;
    const exclude = catData.bookExclude || [];

    return kjvKeys.filter(key => {
      if (!key.startsWith(bookName + ' ')) return false;
      for (const ex of exclude) {
        if (key.startsWith(ex + ' ')) return false;
      }
      return true;
    });
  }

  return kjvKeys;
}

test('默认（无类别）返回所有经文', () => {
  const keys = getKeysForCategory(null);
  if (keys.length !== kjvKeys.length) {
    throw new Error(`预期 ${kjvKeys.length} 节，得到 ${keys.length} 节`);
  }
});

test('love 类别返回正确数量', () => {
  const keys = getKeysForCategory('love');
  const expected = verseCategories.love.verses.length;
  if (keys.length !== expected) {
    throw new Error(`预期 ${expected} 节，得到 ${keys.length} 节`);
  }
});

test('psalms 类别返回整本诗篇', () => {
  const keys = getKeysForCategory('psalms');
  if (keys.length < 1000) {
    throw new Error(`诗篇应该有 2000+ 节，只得到 ${keys.length} 节`);
  }
  logInfo(`   → Psalms: ${keys.length} 节经文`);
});

test('john 类别排除了 1/2/3 John', () => {
  const keys = getKeysForCategory('john');
  const has1John = keys.some(k => k.startsWith('1 John'));
  const has2John = keys.some(k => k.startsWith('2 John'));
  const has3John = keys.some(k => k.startsWith('3 John'));

  if (has1John || has2John || has3John) {
    throw new Error('John 类别不应包含 1/2/3 John');
  }
  logInfo(`   → John: ${keys.length} 节经文（已排除 1/2/3 John）`);
});

test('无效类别返回所有经文（回退）', () => {
  const keys = getKeysForCategory('invalid_category');
  if (keys.length !== kjvKeys.length) {
    throw new Error('无效类别应该返回所有经文');
  }
});

// ============================================================
// 测试 8: 验证 generators.ts 配置
// ============================================================
logSection('测试 8: 验证 generators.ts');

const generatorsContent = fs.readFileSync(generatorsPath, 'utf8');

expectedCategories.forEach(category => {
  test(`generators.ts 包含 ${category}`, () => {
    if (!generatorsContent.includes(`id: "${category}"`)) {
      throw new Error(`generators.ts 中找不到 ${category} 配置`);
    }
  });
});

test('generators.ts 包含所有必需字段', () => {
  const requiredFields = ['id:', 'name:', 'slug:', 'title:', 'description:', 'image:', 'category:'];
  requiredFields.forEach(field => {
    if (!generatorsContent.includes(field)) {
      throw new Error(`generators.ts 缺少字段: ${field}`);
    }
  });
});

// ============================================================
// 测试 9: 验证 slug 格式
// ============================================================
logSection('测试 9: 验证 URL slug');

const slugPattern = /-bible-verses/;
const slugs = [
  'love-bible-verses', 'hope-bible-verses', 'strength-bible-verses',
  'peace-bible-verses', 'faith-bible-verses', 'grief-bible-verses',
  'psalms-bible-verses', 'proverbs-bible-verses', 'john-bible-verses',
  'prayer-bible-verses', 'encouragement-bible-verses',
  'comfort-bible-verses', 'thanksgiving-bible-verses'
];

slugs.forEach(slug => {
  test(`Slug "${slug}" 格式正确`, () => {
    if (!generatorsContent.includes(`slug: "${slug}"`)) {
      throw new Error(`generators.ts 中找不到 slug: "${slug}"`);
    }
  });
});

// ============================================================
// 测试 10: 验证页面文件
// ============================================================
logSection('测试 10: 验证页面文件');

const slugPagePath = path.join(__dirname, 'app', '[slug]', 'page.tsx');
const slugLayoutPath = path.join(__dirname, 'app', '[slug]', 'layout.tsx');
const apiRoutePath = path.join(__dirname, 'app', 'api', 'verse', 'route.ts');

test('[slug]/page.tsx 存在', () => {
  if (!fs.existsSync(slugPagePath)) {
    throw new Error('文件不存在: ' + slugPagePath);
  }
});

test('[slug]/layout.tsx 存在', () => {
  if (!fs.existsSync(slugLayoutPath)) {
    throw new Error('文件不存在: ' + slugLayoutPath);
  }
});

test('API route 已更新', () => {
  const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
  if (!apiContent.includes('getKeysForCategory')) {
    throw new Error('API route 缺少 getKeysForCategory 函数');
  }
  if (!apiContent.includes('VERSE_CATEGORIES')) {
    throw new Error('API route 未加载 verse-categories.json');
  }
});

// ============================================================
// 测试 11: 验证首页集成
// ============================================================
logSection('测试 11: 验证首页集成');

const homePagePath = path.join(__dirname, 'app', 'page.tsx');

test('首页导入了 GENERATORS', () => {
  const content = fs.readFileSync(homePagePath, 'utf8');
  if (!content.includes('import { GENERATORS }')) {
    throw new Error('首页未导入 GENERATORS');
  }
});

test('首页包含 Trending Generators 区域', () => {
  const content = fs.readFileSync(homePagePath, 'utf8');
  if (!content.includes('Trending Generators')) {
    throw new Error('首页未包含 Trending Generators 标题');
  }
});

test('首页渲染所有生成器卡片', () => {
  const content = fs.readFileSync(homePagePath, 'utf8');
  if (!content.includes('GENERATORS.map')) {
    throw new Error('首页未使用 GENERATORS.map 渲染卡片');
  }
});

// ============================================================
// 测试 12: 检查图片
// ============================================================
logSection('测试 12: 检查图片资源');

const imageGuidePath = path.join(__dirname, 'public', 'generators', 'IMAGE_GUIDE.md');

test('图片指南文件存在', () => {
  if (!fs.existsSync(imageGuidePath)) {
    throw new Error('IMAGE_GUIDE.md 不存在');
  }
});

// 检查是否有自定义图片
const generatorsDir = path.join(__dirname, 'public', 'generators');
const imageFiles = fs.existsSync(generatorsDir)
  ? fs.readdirSync(generatorsDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i))
  : [];

if (imageFiles.length === 0) {
  warn('尚未添加自定义图片（当前使用占位符）');
  logInfo('   → 参考 public/generators/IMAGE_GUIDE.md 添加主题图片');
} else {
  logSuccess(`找到 ${imageFiles.length} 个图片文件`);
  imageFiles.forEach(img => logInfo(`   → ${img}`));
}

// ============================================================
// 最终报告
// ============================================================
logSection('测试结果摘要');

log('');
log(`总测试数: ${totalTests}`, 'bold');
log(`✅ 通过: ${passedTests}`, 'green');
log(`❌ 失败: ${failedTests}`, 'red');
log(`⚠️  警告: ${warnings}`, 'yellow');
log('');

if (failedTests === 0 && warnings === 0) {
  logSuccess('🎉 所有测试通过！功能已准备就绪！');
  log('');
  logInfo('下一步:');
  logInfo('1. 运行 npm install && npm run dev');
  logInfo('2. 访问 http://localhost:3000 查看效果');
  logInfo('3. 添加自定义图片（参考 IMAGE_GUIDE.md）');
  log('');
} else if (failedTests === 0) {
  logSuccess('✅ 所有测试通过！');
  logWarning(`但有 ${warnings} 个警告需要注意`);
  log('');
} else {
  logError(`❌ 有 ${failedTests} 个测试失败`);
  log('');
  logInfo('请修复上述错误后重新测试');
  log('');
  process.exit(1);
}
