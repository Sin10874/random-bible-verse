#!/bin/bash

echo "🧪 测试所有西班牙语类别..."
echo ""

categories=(love hope strength peace faith grief prayer encouragement thanksgiving psalms proverbs john)

for category in "${categories[@]}"; do
  echo "📖 Testing $category:"
  curl -s "http://localhost:3000/api/verse?locale=es&category=$category" | jq -r '"\(.reference): \(.text[:70])..."'
  echo ""
  sleep 0.2
done

echo "✅ 测试完成！"
