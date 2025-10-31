const fs = require('fs');

const filePath = 'app/[slug]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// In content strings (between quotes), replace straight quotes and apostrophes
// This regex finds content: "..." patterns and fixes quotes/apostrophes inside them
content = content.replace(/content: "([^"]+)"/g, (match, innerContent) => {
  // Replace straight quotes with curly quotes
  let fixed = innerContent
    // Replace apostrophes/single quotes
    .replace(/don't/g, "don&apos;t")
    .replace(/doesn't/g, "doesn&apos;t")
    .replace(/isn't/g, "isn&apos;t")
    .replace(/can't/g, "can&apos;t")
    .replace(/you're/g, "you&apos;re")
    .replace(/we're/g, "we&apos;re")
    .replace(/it's/g, "it&apos;s")
    .replace(/that's/g, "that&apos;s")
    .replace(/there's/g, "there&apos;s")
    .replace(/God's/g, "God&apos;s")
    .replace(/Christ's/g, "Christ&apos;s")
    .replace(/world's/g, "world&apos;s")
    .replace(/life's/g, "life&apos;s")
    .replace(/you've/g, "you&apos;ve")
    .replace(/we've/g, "we&apos;ve")
    .replace(/they've/g, "they&apos;ve")
    // Replace straight double quotes with curly quotes (only if not already escaped)
    .replace(/"([^"&]+)"/g, "&ldquo;$1&rdquo;");

  return `content: "${fixed}"`;
});

// Also fix in title strings
content = content.replace(/title: "([^"]+)"/g, (match, innerContent) => {
  let fixed = innerContent
    .replace(/God's/g, "God&apos;s")
    .replace(/Christ's/g, "Christ&apos;s")
    .replace(/"([^"&]+)"/g, "&ldquo;$1&rdquo;");

  return `title: "${fixed}"`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed all quotes and apostrophes in', filePath);
