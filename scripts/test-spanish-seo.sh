#!/bin/bash

echo "🧪 测试所有西班牙语页面的SEO标题..."
echo ""

categories=(purity love hope strength peace faith grief prayer encouragement thanksgiving psalms proverbs john)

for category in "${categories[@]}"; do
  if [ "$category" = "purity" ]; then
    slug="pornography-prayer-points-with-scriptures"
  else
    slug="${category}-bible-verses"
  fi

  title=$(curl -s "http://localhost:3000/es/$slug" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
  echo "✓ $category: $title"
done

echo ""
echo "✅ 所有页面测试完成！"
