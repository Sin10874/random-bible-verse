const fs = require('fs');
const path = require('path');

// Load data files
const kjvMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'kjv-map.json'), 'utf8'));
const rv1960Map = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'rv1960-map.json'), 'utf8'));
const verseCategories = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'verse-categories.json'), 'utf8'));

const kjvKeys = Object.keys(kjvMap);
const rv1960Keys = Object.keys(rv1960Map);

console.log(`\n📊 Bible Verse Availability Analysis\n`);
console.log(`Total Verses Available:`);
console.log(`  English (KJV): ${kjvKeys.length}`);
console.log(`  Spanish (RV1960): ${rv1960Keys.length}`);
console.log(`\n${'='.repeat(80)}\n`);

const results = [];

// Analyze each category
for (const [categoryId, categoryData] of Object.entries(verseCategories)) {
  let englishCount = 0;
  let spanishCount = 0;
  let type = '';

  if (categoryData.verses) {
    // Theme-based category with fixed verse list
    type = 'Theme-based (Fixed List)';
    englishCount = categoryData.verses.length;
    spanishCount = categoryData.verses.filter(ref => rv1960Map[ref]).length;
  } else if (categoryData.bookFilter) {
    // Book-based category
    type = 'Book-based (Dynamic)';
    const bookName = categoryData.bookFilter;
    const exclude = categoryData.bookExclude || [];

    // Count English verses
    englishCount = kjvKeys.filter(key => {
      if (!key.startsWith(bookName + ' ')) return false;
      for (const ex of exclude) {
        if (key.startsWith(ex + ' ')) return false;
      }
      return true;
    }).length;

    // Count Spanish verses
    spanishCount = rv1960Keys.filter(key => {
      if (!key.startsWith(bookName + ' ')) return false;
      for (const ex of exclude) {
        if (key.startsWith(ex + ' ')) return false;
      }
      return true;
    }).length;
  }

  results.push({
    id: categoryId,
    name: categoryData.name,
    type,
    englishCount,
    spanishCount,
    coverage: englishCount > 0 ? ((spanishCount / englishCount) * 100).toFixed(1) : '0.0'
  });
}

// Sort results: special (purity) first, then theme, then book
results.sort((a, b) => {
  if (a.id === 'purity') return -1;
  if (b.id === 'purity') return 1;
  if (a.type.includes('Theme') && !b.type.includes('Theme')) return -1;
  if (!a.type.includes('Theme') && b.type.includes('Theme')) return 1;
  return 0;
});

// Print results table
console.log(`┌─────────────────┬──────────────────────────┬─────────┬─────────┬──────────┐`);
console.log(`│ Category        │ Type                     │ English │ Spanish │ Coverage │`);
console.log(`├─────────────────┼──────────────────────────┼─────────┼─────────┼──────────┤`);

for (const result of results) {
  const id = result.id.padEnd(15);
  const type = result.type.padEnd(24);
  const eng = result.englishCount.toString().padStart(7);
  const spa = result.spanishCount.toString().padStart(7);
  const cov = (result.coverage + '%').padStart(8);
  console.log(`│ ${id} │ ${type} │ ${eng} │ ${spa} │ ${cov} │`);
}

console.log(`└─────────────────┴──────────────────────────┴─────────┴─────────┴──────────┘`);

// Analysis and recommendations
console.log(`\n📝 Analysis:\n`);

const themeResults = results.filter(r => r.type.includes('Theme'));
const bookResults = results.filter(r => r.type.includes('Book'));

console.log(`Theme-based Generators (Fixed Lists):`);
for (const result of themeResults) {
  const missing = result.englishCount - result.spanishCount;
  if (missing > 0) {
    console.log(`  ⚠️  ${result.id}: Missing ${missing} verses (${result.coverage}% coverage)`);
  } else {
    console.log(`  ✅ ${result.id}: Full coverage (${result.spanishCount} verses)`);
  }
}

console.log(`\nBook-based Generators (Dynamic):`);
for (const result of bookResults) {
  console.log(`  📖 ${result.id}: ${result.spanishCount} verses available (${result.coverage}% of English)`);
}

console.log(`\n💡 Recommendations:\n`);

const lowCoverageThemes = themeResults.filter(r => parseFloat(r.coverage) < 100);
if (lowCoverageThemes.length > 0) {
  console.log(`⚠️  The following theme-based generators have incomplete Spanish coverage:`);
  for (const result of lowCoverageThemes) {
    console.log(`   - ${result.id}: ${result.coverage}% (missing ${result.englishCount - result.spanishCount} verses)`);
  }
  console.log(`\n   Action: Consider replacing missing verses with similar Spanish verses from RV1960`);
  console.log(`           or accept that some verses will fallback to English.`);
} else {
  console.log(`✅ All theme-based generators have full Spanish coverage!`);
}

console.log(`\n${'='.repeat(80)}\n`);
