#!/bin/bash

# 下载所有 13 个生成器的图片
# 使用 Unsplash 的特定照片 URL

echo "🎨 开始下载 Unsplash 图片..."
echo ""

# 确保目录存在
mkdir -p public/generators

# 定义图片下载函数
download_image() {
    local name=$1
    local photo_id=$2
    local filename=$3
    local width=${4:-1600}
    local height=${5:-900}

    echo "📥 下载 $name..."
    curl -L "https://images.unsplash.com/photo-${photo_id}?w=${width}&h=${height}&fit=crop&q=80" \
         -o "public/generators/${filename}" \
         -H "User-Agent: Mozilla/5.0" \
         --max-time 30

    if [ $? -eq 0 ]; then
        echo "✅ $name 下载成功"
    else
        echo "❌ $name 下载失败"
    fi
    echo ""
}

# 1. Love - 浪漫日落情侣
download_image "Love (浪漫日落)" "1516589178398-74d4077ceb36" "love.jpg"

# 2. Hope - 日出山景
download_image "Hope (日出希望)" "1506905925346-21bda4d32df4" "hope.jpg"

# 3. Strength - 山峰攀登
download_image "Strength (力量山峰)" "1506905925346-21bda4d32df4" "strength.jpg"

# 4. Peace - 平静湖泊
download_image "Peace (平静湖泊)" "1506905925346-21bda4d32df4" "peace.jpg"

# 5. Faith - 星空
download_image "Faith (星空信仰)" "1419242902214-272b3f66ee7a" "faith.jpg"

# 6. Grief - 雨窗
download_image "Grief (雨窗悲伤)" "1428908728789-d2de25dbd4e2" "grief.jpg"

# 7. Psalms - 敬拜
download_image "Psalms (诗篇敬拜)" "1483736762161-1d107f3c78e1" "psalms.jpg"

# 8. Proverbs - 古书
download_image "Proverbs (箴言古书)" "1481627834876-b7833e8f5570" "proverbs.jpg"

# 9. John - 光芒
download_image "John (约翰光芒)" "1501594907352-04cda38ebc29" "john.jpg"

# 10. Prayer - 祷告的手
download_image "Prayer (祷告之手)" "1484480974693-6ca0a78fb36b" "prayer.jpg"

# 11. Encouragement - 山顶胜利
download_image "Encouragement (山顶鼓励)" "1506905925346-21bda4d32df4" "encouragement.jpg"

# 12. Comfort - 温暖壁炉
download_image "Comfort (舒适壁炉)" "1513694203232-719401b91226" "comfort.jpg"

# 13. Thanksgiving - 秋天丰收
download_image "Thanksgiving (感恩丰收)" "1507925921958-8a62f3d1a50d" "thanksgiving.jpg"

echo ""
echo "🎉 所有图片下载完成！"
echo ""
echo "📊 检查文件大小..."
ls -lh public/generators/*.jpg 2>/dev/null || echo "未找到图片文件"
echo ""
echo "📏 检查是否需要压缩（目标 < 500KB）..."
for file in public/generators/*.jpg; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        size_kb=$((size / 1024))
        if [ $size_kb -gt 500 ]; then
            echo "⚠️  $(basename $file) - ${size_kb}KB (需要压缩)"
        else
            echo "✅ $(basename $file) - ${size_kb}KB"
        fi
    fi
done
echo ""
echo "💡 如果需要压缩，运行：./compress-images.sh"
