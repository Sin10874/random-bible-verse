#!/usr/bin/env node

/**
 * 诊断脚本：检查为什么看不到 Trending Generators
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 诊断 Trending Generators 显示问题\n');
console.log('=' .repeat(60));

let issues = [];
let checks = 0;

function check(description, fn) {
  checks++;
  process.stdout.write(`${checks}. ${description}... `);
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log('✅');
      return true;
    } else {
      console.log('❌');
      issues.push(description);
      if (typeof result === 'string') {
        console.log(`   → ${result}`);
      }
      return false;
    }
  } catch (error) {
    console.log('❌');
    issues.push(description);
    console.log(`   → 错误: ${error.message}`);
    return false;
  }
}

// 检查文件
console.log('\n📁 检查文件完整性:\n');

check('page.tsx 存在', () => {
  return fs.existsSync('app/page.tsx');
});

check('generators.ts 存在', () => {
  return fs.existsSync('app/data/generators.ts');
});

check('verse-categories.json 存在', () => {
  return fs.existsSync('public/verse-categories.json');
});

// 检查代码内容
console.log('\n📝 检查代码内容:\n');

check('page.tsx 包含 "Trending Generators"', () => {
  const content = fs.readFileSync('app/page.tsx', 'utf8');
  if (!content.includes('Trending Generators')) {
    return '未找到 "Trending Generators" 文本';
  }
  return true;
});

check('page.tsx 导入了 GENERATORS', () => {
  const content = fs.readFileSync('app/page.tsx', 'utf8');
  if (!content.includes('import { GENERATORS }')) {
    return '未导入 GENERATORS';
  }
  return true;
});

check('page.tsx 使用了 GENERATORS.map', () => {
  const content = fs.readFileSync('app/page.tsx', 'utf8');
  if (!content.includes('GENERATORS.map')) {
    return '未使用 GENERATORS.map 渲染卡片';
  }
  return true;
});

check('generators.ts 导出了 GENERATORS', () => {
  const content = fs.readFileSync('app/data/generators.ts', 'utf8');
  if (!content.includes('export const GENERATORS')) {
    return '未导出 GENERATORS';
  }
  return true;
});

check('GENERATORS 数组不为空', () => {
  const content = fs.readFileSync('app/data/generators.ts', 'utf8');
  // 简单检查是否有多个 generator 定义
  const matches = content.match(/id:\s*"[^"]+"/g);
  if (!matches || matches.length < 13) {
    return `只找到 ${matches ? matches.length : 0} 个生成器，应该有 13 个`;
  }
  return true;
});

// 检查编译目录
console.log('\n🏗️  检查编译状态:\n');

check('.next 目录存在', () => {
  if (!fs.existsSync('.next')) {
    return '需要运行 npm run dev';
  }
  return true;
});

check('node_modules 存在', () => {
  if (!fs.existsSync('node_modules')) {
    return '需要运行 npm install';
  }
  return true;
});

// 检查 Git 状态
console.log('\n📦 检查代码版本:\n');

const { execSync } = require('child_process');

try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`   当前分支: ${branch}`);

  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
  console.log(`   最后提交: ${lastCommit}`);

  check('代码是最新的', () => {
    try {
      execSync('git fetch origin', { encoding: 'utf8', stdio: 'pipe' });
      const status = execSync('git status -uno', { encoding: 'utf8' });
      if (status.includes('Your branch is behind')) {
        return '需要 git pull 获取最新代码';
      }
      return true;
    } catch (e) {
      return true; // 网络问题时跳过
    }
  });
} catch (e) {
  console.log('   ⚠️  无法检查 Git 状态');
}

// 生成诊断报告
console.log('\n' + '='.repeat(60));
console.log('📊 诊断报告\n');

if (issues.length === 0) {
  console.log('✅ 所有检查通过！代码应该是正常的。\n');
  console.log('🤔 如果还是看不到 Trending Generators，可能是：\n');
  console.log('1. 你没有向下滚动页面');
  console.log('   → 在首页向下滚动，模块在首屏下方\n');
  console.log('2. 服务器没有重启');
  console.log('   → 停止服务器(Ctrl+C)，运行: npm run dev -- -p 3001\n');
  console.log('3. 浏览器缓存问题');
  console.log('   → 按 Ctrl+Shift+R 强制刷新\n');
  console.log('4. 编译错误');
  console.log('   → 查看终端是否有红色错误信息\n');
} else {
  console.log(`❌ 发现 ${issues.length} 个问题:\n`);
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
  console.log('\n建议修复步骤:');
  console.log('1. 确保代码是最新的: git pull');
  console.log('2. 删除缓存: rm -rf .next');
  console.log('3. 重新启动: npm run dev -- -p 3001\n');
}

console.log('='.repeat(60));
console.log('\n💡 下一步操作建议:\n');
console.log('1. 在终端运行以下命令:');
console.log('   git pull');
console.log('   rm -rf .next');
console.log('   npm run dev -- -p 3001\n');
console.log('2. 访问 http://localhost:3001');
console.log('3. 向下滚动页面（用鼠标滚轮）');
console.log('4. 查找 "Trending Generators" 标题\n');
console.log('5. 如果终端有错误，截图发给我\n');
