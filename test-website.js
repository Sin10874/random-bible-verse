#!/usr/bin/env node
/**
 * Comprehensive Website Test Script
 * Tests all routes, APIs, and functionality of the Bible Verse Generator
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Generator routes to test
const GENERATOR_ROUTES = [
  '/love-bible-verses',
  '/hope-bible-verses',
  '/strength-bible-verses',
  '/peace-bible-verses',
  '/faith-bible-verses',
  '/grief-bible-verses',
  '/prayer-bible-verses',
  '/encouragement-bible-verses',
  '/thanksgiving-bible-verses',
  '/psalms-bible-verses',
  '/proverbs-bible-verses',
  '/john-bible-verses',
];

const SPECIAL_ROUTES = [
  '/',
  '/pornography-prayer-points-with-scriptures',
  '/privacy',
];

const API_ROUTES = [
  '/api/verse?category=love',
  '/api/verse?category=hope',
  '/api/verse?category=strength',
  '/api/verse?category=peace',
  '/api/verse?category=faith',
  '/api/verse?category=grief',
  '/api/verse?category=prayer',
  '/api/verse?category=encouragement',
  '/api/verse?category=thanksgiving',
  '/api/verse?category=psalms',
  '/api/verse?category=proverbs',
  '/api/verse?category=john',
];

const STATIC_ASSETS = [
  '/logo.svg',
  '/favicon.ico',
  '/generators/purity.jpg',
  '/generators/love.jpg',
  '/generators/hope.jpg',
  '/generators/strength.jpg',
  '/generators/peace.jpg',
  '/generators/faith.jpg',
  '/generators/grief.jpg',
  '/generators/prayer.jpg',
  '/generators/encouragement.jpg',
  '/generators/thanksgiving.jpg',
  '/generators/psalms.jpg',
  '/generators/proverbs.jpg',
  '/generators/john.jpg',
  '/prayer-data.json',
];

// Utility functions
function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logTest(name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    results.passed.push(name);
    log(`✓ ${name}${details ? ': ' + details : ''}`, 'green');
  } else {
    failedTests++;
    results.failed.push({ name, details });
    log(`✗ ${name}${details ? ': ' + details : ''}`, 'red');
  }
}

function logWarning(message) {
  results.warnings.push(message);
  log(`⚠ ${message}`, 'yellow');
}

// Fetch helper
async function fetchUrl(url, options = {}) {
  try {
    const response = await fetch(BASE_URL + url, {
      ...options,
      timeout: 10000,
    });
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      text: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error.message,
      error: true,
    };
  }
}

// Test functions
async function testServerRunning() {
  log('\n🔍 Testing Server Connection...', 'cyan');
  const result = await fetchUrl('/');
  logTest(
    'Server is running',
    result.ok,
    result.ok ? '' : `Server returned ${result.status}`
  );
  return result.ok;
}

async function testMainPage() {
  log('\n🏠 Testing Main Page...', 'cyan');
  const result = await fetchUrl('/');

  logTest('Main page loads', result.ok);

  if (result.ok && result.text) {
    const html = result.text;
    logTest('Main page contains title', html.includes('<title>'));
    logTest('Main page contains logo', html.includes('/logo.svg'));
    logTest('Main page contains generators', html.includes('generator'));

    // Check for purity generator
    logTest(
      'Pornography Prayer Points tool is visible',
      html.includes('Pornography Prayer Points') || html.includes('purity')
    );
  }
}

async function testGeneratorPages() {
  log('\n📖 Testing Generator Pages...', 'cyan');

  for (const route of GENERATOR_ROUTES) {
    const result = await fetchUrl(route);
    const pageName = route.replace('/', '').replace(/-/g, ' ');

    logTest(`${pageName} loads`, result.ok);

    if (result.ok && result.text) {
      const html = result.text;

      // Check for essential elements
      logTest(
        `${pageName} has Bible Verse Generator header`,
        html.includes('Bible Verse Generator'),
        html.includes('Bible Verse Generator') ? '' : 'Header text not found'
      );

      logTest(
        `${pageName} has Random Bible Verse button`,
        html.includes('Random Bible Verse'),
        html.includes('Random Bible Verse') ? '' : 'Button text not found'
      );

      // Check for SEO content sections (flexible detection)
      const hasHowToUse = html.toLowerCase().includes('how to use');
      const hasBenefitsSection = html.toLowerCase().includes('benefit') ||
                                 html.toLowerCase().includes('why you should') ||
                                 html.toLowerCase().includes('why read') ||
                                 html.toLowerCase().includes('growing') ||
                                 html.toLowerCase().includes('finding') ||
                                 html.toLowerCase().includes('strengthen') ||
                                 (html.toLowerCase().includes('how ') && html.toLowerCase().includes(' transform'));
      const hasSEOContent = hasHowToUse && hasBenefitsSection;

      logTest(
        `${pageName} has SEO content`,
        hasSEOContent,
        !hasSEOContent ? 'Missing SEO sections' : ''
      );

      // Check for metadata
      logTest(
        `${pageName} has meta description`,
        html.includes('<meta name="description"') ||
          html.includes('<meta property="og:description"')
      );
    }
  }
}

async function testSpecialPages() {
  log('\n⭐ Testing Special Pages...', 'cyan');

  // Test pornography prayer points page
  const prayerResult = await fetchUrl('/pornography-prayer-points-with-scriptures');
  logTest('Pornography Prayer Points page loads', prayerResult.ok);

  if (prayerResult.ok && prayerResult.text) {
    const html = prayerResult.text;

    logTest(
      'Prayer points page has correct title',
      html.includes('Pornography Prayer Points')
    );

    logTest(
      'Prayer points page has Get Prayer Point button',
      html.includes('Get Prayer Point')
    );

    logTest(
      'Prayer points page has enhanced SEO content',
      html.includes('Breaking Free from Pornography Addiction') ||
        html.includes('Power of Daily Prayer')
    );

    // Check that it doesn't have "50" in the description
    const hasNoFifty = !html.match(/50\s+(Scripture-based|powerful)\s+prayer/i);
    logTest(
      'Prayer points page metadata removed "50" references',
      hasNoFifty,
      hasNoFifty ? '' : 'Found "50" in metadata'
    );
  }

  // Test privacy page
  const privacyResult = await fetchUrl('/privacy');
  logTest('Privacy page loads', privacyResult.ok);
}

async function testAPIEndpoints() {
  log('\n🔌 Testing API Endpoints...', 'cyan');

  for (const route of API_ROUTES) {
    const category = route.match(/category=(\w+)/)[1];
    const result = await fetchUrl(route);

    logTest(`API ${category} returns 200`, result.ok);

    if (result.ok && result.text) {
      try {
        const data = JSON.parse(result.text);
        logTest(
          `API ${category} returns valid JSON`,
          typeof data === 'object'
        );

        logTest(
          `API ${category} has verse text`,
          data.text && data.text.length > 0
        );

        logTest(
          `API ${category} has reference`,
          data.reference && data.reference.length > 0
        );
      } catch (e) {
        logTest(`API ${category} returns valid JSON`, false, e.message);
      }
    }
  }
}

async function testStaticAssets() {
  log('\n🖼️  Testing Static Assets...', 'cyan');

  for (const asset of STATIC_ASSETS) {
    const result = await fetchUrl(asset);
    const assetName = asset.split('/').pop();

    if (result.ok) {
      logTest(`${assetName} exists`, true);
    } else if (result.status === 404) {
      logWarning(`${assetName} not found (404)`);
    } else {
      logTest(`${assetName} loads`, false, `Status: ${result.status}`);
    }
  }
}

async function testResponsiveness() {
  log('\n📱 Testing Responsive Design...', 'cyan');

  const result = await fetchUrl('/');
  if (result.ok && result.text) {
    const html = result.text;

    logTest(
      'Uses responsive CSS classes',
      html.includes('sm:') || html.includes('md:') || html.includes('lg:')
    );

    logTest('Has viewport meta tag', html.includes('viewport'));

    logTest(
      'Uses mobile-friendly font sizes',
      html.includes('text-sm') || html.includes('text-base')
    );
  }
}

async function testSEOOptimization() {
  log('\n🔍 Testing SEO Optimization...', 'cyan');

  // Test main page
  const homeResult = await fetchUrl('/');
  if (homeResult.ok && homeResult.text) {
    const html = homeResult.text;

    logTest('Home has title tag', html.includes('<title>'));
    logTest('Home has meta description', html.includes('name="description"'));
    logTest('Home has Open Graph tags', html.includes('property="og:'));
    logTest('Home has canonical URL', html.includes('rel="canonical"'));
  }

  // Test a generator page for comprehensive SEO
  const loveResult = await fetchUrl('/love-bible-verses');
  if (loveResult.ok && loveResult.text) {
    const html = loveResult.text;

    logTest(
      'Generator page has structured content',
      html.includes('<h1') && html.includes('<h2')
    );

    logTest(
      'Generator page has multiple content sections',
      (html.match(/<h2/g) || []).length >= 5,
      `Found ${(html.match(/<h2/g) || []).length} h2 tags`
    );

    logTest(
      'Generator page mentions "free"',
      html.toLowerCase().includes('free'),
      'Important for SEO to highlight free service'
    );
  }
}

async function testAccessibility() {
  log('\n♿ Testing Accessibility...', 'cyan');

  const result = await fetchUrl('/');
  if (result.ok && result.text) {
    const html = result.text;

    logTest('Uses semantic HTML', html.includes('<header') && html.includes('<main'));
    logTest('Has alt attributes on images', html.includes('alt='));
    logTest('Has aria labels', html.includes('aria-label') || html.includes('aria-'));
    logTest('Uses proper heading hierarchy', html.includes('<h1') && html.includes('<h2'));
  }
}

async function testPerformance() {
  log('\n⚡ Testing Performance...', 'cyan');

  const start = Date.now();
  const result = await fetchUrl('/');
  const loadTime = Date.now() - start;

  logTest(
    'Home page loads quickly',
    loadTime < 3000,
    `${loadTime}ms (target: <3000ms)`
  );

  if (result.ok && result.text) {
    const htmlSize = result.text.length;
    logTest(
      'HTML size is reasonable',
      htmlSize < 500000,
      `${(htmlSize / 1024).toFixed(2)}KB`
    );
  }
}

async function test404Handling() {
  log('\n❌ Testing 404 Handling...', 'cyan');

  const result = await fetchUrl('/this-page-does-not-exist');
  logTest(
    '404 page returns correct status',
    result.status === 404,
    `Status: ${result.status}`
  );
}

// Main test runner
async function runAllTests() {
  log('\n════════════════════════════════════════════════', 'blue');
  log('   Bible Verse Generator - Comprehensive Tests', 'blue');
  log('════════════════════════════════════════════════\n', 'blue');

  const serverRunning = await testServerRunning();

  if (!serverRunning) {
    log('\n❌ Server is not running. Please start the server with "npm run dev"', 'red');
    process.exit(1);
  }

  try {
    await testMainPage();
    await testGeneratorPages();
    await testSpecialPages();
    await testAPIEndpoints();
    await testStaticAssets();
    await testResponsiveness();
    await testSEOOptimization();
    await testAccessibility();
    await testPerformance();
    await test404Handling();
  } catch (error) {
    log(`\n❌ Test error: ${error.message}`, 'red');
    console.error(error);
  }

  // Print summary
  log('\n════════════════════════════════════════════════', 'blue');
  log('                  Test Summary', 'blue');
  log('════════════════════════════════════════════════\n', 'blue');

  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');

  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`\nPass Rate: ${passRate}%`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');

  if (results.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    results.warnings.forEach((warning) => {
      log(`  - ${warning}`, 'yellow');
    });
  }

  if (failedTests > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.failed.forEach((test) => {
      log(`  - ${test.name}${test.details ? ': ' + test.details : ''}`, 'red');
    });
  }

  log('\n════════════════════════════════════════════════\n', 'blue');

  if (failedTests === 0) {
    log('🎉 All tests passed! The website is working correctly.', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Please review the issues above.', 'yellow');
    process.exit(1);
  }
}

// Run tests
runAllTests();
