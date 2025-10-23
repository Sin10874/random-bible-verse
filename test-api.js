#!/usr/bin/env node

/**
 * API 测试脚本：测试 /api/verse 端点
 *
 * 使用前请确保开发服务器已启动：npm run dev
 * 运行方式：node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// 颜色代码
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
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

function logInfo(message) {
  log('ℹ️  ' + message, 'cyan');
}

function logSection(message) {
  log('\n' + '='.repeat(60), 'bold');
  log(message, 'bold');
  log('='.repeat(60), 'bold');
}

// HTTP GET 请求辅助函数
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data)
          });
        } catch (e) {
          reject(new Error('Invalid JSON response: ' + data));
        }
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  logSection('API 测试 - Trending Generators 功能');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function test(description, url, validator) {
    totalTests++;
    try {
      logInfo(`测试: ${description}`);
      const response = await httpGet(url);

      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}`);
      }

      if (validator) {
        validator(response.data);
      }

      logSuccess(`通过: ${description}`);
      logInfo(`   → Reference: ${response.data.reference || 'N/A'}`);
      if (response.data.text) {
        const preview = response.data.text.substring(0, 100);
        logInfo(`   → Text: ${preview}${response.data.text.length > 100 ? '...' : ''}`);
      }

      passedTests++;
      return response;
    } catch (error) {
      failedTests++;
      logError(`失败: ${description}`);
      logError(`   → ${error.message}`);
      return null;
    }
  }

  // ============================================================
  // 测试 1: 基础 API 测试
  // ============================================================
  logSection('测试 1: 基础功能');

  await test(
    '默认端点（无参数）',
    `${BASE_URL}/api/verse`,
    (data) => {
      if (!data.text) throw new Error('缺少 text 字段');
      if (!data.reference) throw new Error('缺少 reference 字段');
    }
  );

  await test(
    'Debug 模式',
    `${BASE_URL}/api/verse?debug=1`,
    (data) => {
      if (!data.debug) throw new Error('缺少 debug 信息');
      if (!data.debug.source) throw new Error('缺少 debug.source');
      if (!data.verse) throw new Error('缺少 verse 对象');
      logInfo(`   → Source: ${data.debug.source}`);
      logInfo(`   → Available verses: ${data.debug.availableVerses || 'N/A'}`);
      logInfo(`   → Category: ${data.debug.category || 'N/A'}`);
      logInfo(`   → Latency: ${data.debug.latencyMs}ms`);
    }
  );

  // ============================================================
  // 测试 2: 主题类别测试
  // ============================================================
  logSection('测试 2: 主题类别过滤');

  const themeCategories = [
    'love', 'hope', 'strength', 'peace', 'faith', 'grief'
  ];

  for (const category of themeCategories) {
    await test(
      `${category} 类别`,
      `${BASE_URL}/api/verse?category=${category}&debug=1`,
      (data) => {
        if (!data.verse) throw new Error('缺少 verse');
        if (data.debug.category !== category) {
          throw new Error(`预期 category=${category}，得到 ${data.debug.category}`);
        }
        logInfo(`   → Available: ${data.debug.availableVerses} verses`);
      }
    );
  }

  // ============================================================
  // 测试 3: 书卷类别测试
  // ============================================================
  logSection('测试 3: 书卷类别过滤');

  const bookCategories = [
    { name: 'psalms', expectedMin: 1000 },
    { name: 'proverbs', expectedMin: 900 },
    { name: 'john', expectedMin: 800 }
  ];

  for (const { name, expectedMin } of bookCategories) {
    const response = await test(
      `${name} 类别`,
      `${BASE_URL}/api/verse?category=${name}&debug=1`,
      (data) => {
        if (!data.verse) throw new Error('缺少 verse');
        if (data.debug.availableVerses < expectedMin) {
          throw new Error(`预期至少 ${expectedMin} 节，得到 ${data.debug.availableVerses} 节`);
        }

        // 验证引用格式
        const ref = data.verse.reference;
        if (name === 'psalms' && !ref.startsWith('Psalms')) {
          throw new Error(`预期 Psalms 引用，得到 ${ref}`);
        }
        if (name === 'proverbs' && !ref.startsWith('Proverbs')) {
          throw new Error(`预期 Proverbs 引用，得到 ${ref}`);
        }
        if (name === 'john' && !ref.startsWith('John ')) {
          throw new Error(`预期 John 引用，得到 ${ref}`);
        }
        if (name === 'john' && (ref.startsWith('1 John') || ref.startsWith('2 John') || ref.startsWith('3 John'))) {
          throw new Error(`John 类别不应返回 1/2/3 John: ${ref}`);
        }
      }
    );
  }

  // ============================================================
  // 测试 4: 场景类别测试
  // ============================================================
  logSection('测试 4: 场景类别过滤');

  const scenarioCategories = [
    'prayer', 'encouragement', 'comfort', 'thanksgiving'
  ];

  for (const category of scenarioCategories) {
    await test(
      `${category} 类别`,
      `${BASE_URL}/api/verse?category=${category}&debug=1`,
      (data) => {
        if (!data.verse) throw new Error('缺少 verse');
        if (data.debug.category !== category) {
          throw new Error(`预期 category=${category}，得到 ${data.debug.category}`);
        }
        logInfo(`   → Available: ${data.debug.availableVerses} verses`);
      }
    );
  }

  // ============================================================
  // 测试 5: 多次请求测试（去重测试）
  // ============================================================
  logSection('测试 5: 去重机制测试');

  logInfo('连续请求同一类别 10 次，检查去重...');
  const responses = [];
  for (let i = 0; i < 10; i++) {
    const res = await httpGet(`${BASE_URL}/api/verse?category=love`);
    if (res.statusCode === 200) {
      responses.push(res.data.reference);
    }
  }

  if (responses.length > 0) {
    const uniqueRefs = new Set(responses);
    logInfo(`   → 收到 ${responses.length} 个响应`);
    logInfo(`   → 其中 ${uniqueRefs.size} 个不同经文`);
    logInfo(`   → 重复率: ${((1 - uniqueRefs.size / responses.length) * 100).toFixed(1)}%`);

    if (uniqueRefs.size >= 8) {
      logSuccess('去重机制工作正常（10 次请求中至少 8 个不同）');
      passedTests++;
    } else {
      logError('去重机制可能有问题（重复太多）');
      failedTests++;
    }
    totalTests++;
  }

  // ============================================================
  // 测试 6: 错误处理测试
  // ============================================================
  logSection('测试 6: 错误处理');

  await test(
    '无效类别（应回退到所有经文）',
    `${BASE_URL}/api/verse?category=invalid_category&debug=1`,
    (data) => {
      // 无效类别应该返回所有经文
      if (!data.verse) throw new Error('应该返回经文');
      logInfo(`   → 回退到所有经文模式`);
    }
  );

  // ============================================================
  // 测试 7: 性能测试
  // ============================================================
  logSection('测试 7: 响应性能');

  logInfo('测试 API 响应时间...');
  const perfResults = [];

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await httpGet(`${BASE_URL}/api/verse?debug=1`);
    const duration = Date.now() - start;
    perfResults.push(duration);
  }

  const avgTime = perfResults.reduce((a, b) => a + b, 0) / perfResults.length;
  const minTime = Math.min(...perfResults);
  const maxTime = Math.max(...perfResults);

  logInfo(`   → 平均响应时间: ${avgTime.toFixed(2)}ms`);
  logInfo(`   → 最快响应: ${minTime}ms`);
  logInfo(`   → 最慢响应: ${maxTime}ms`);

  if (avgTime < 100) {
    logSuccess('性能优秀（< 100ms）');
    passedTests++;
  } else if (avgTime < 500) {
    logSuccess('性能良好（< 500ms）');
    passedTests++;
  } else {
    logError('性能较慢（> 500ms）');
    failedTests++;
  }
  totalTests++;

  // ============================================================
  // 最终报告
  // ============================================================
  logSection('测试结果摘要');

  log('');
  log(`总测试数: ${totalTests}`, 'bold');
  log(`✅ 通过: ${passedTests}`, 'green');
  log(`❌ 失败: ${failedTests}`, 'red');
  log('');

  if (failedTests === 0) {
    logSuccess('🎉 所有 API 测试通过！');
    log('');
    logInfo('下一步:');
    logInfo('1. 在浏览器访问 http://localhost:3000');
    logInfo('2. 测试前端 UI 功能');
    logInfo('3. 测试各个生成器页面');
    log('');
  } else {
    logError(`❌ 有 ${failedTests} 个测试失败`);
    log('');
    logInfo('请检查服务器日志并修复问题');
    log('');
  }
}

// ============================================================
// 主程序
// ============================================================
async function main() {
  log('');
  logInfo('正在连接开发服务器...');
  logInfo(`Base URL: ${BASE_URL}`);
  log('');

  try {
    // 先检查服务器是否运行
    await httpGet(`${BASE_URL}/api/verse`);
    logSuccess('服务器连接成功！');
  } catch (error) {
    logError('无法连接到开发服务器！');
    log('');
    logInfo('请先启动开发服务器：');
    logInfo('  npm run dev');
    log('');
    logInfo('然后重新运行此测试：');
    logInfo('  node test-api.js');
    log('');
    process.exit(1);
  }

  await testAPI();
}

main().catch(error => {
  logError('测试过程出错：' + error.message);
  console.error(error);
  process.exit(1);
});
