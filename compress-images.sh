#!/bin/bash

# 压缩图片脚本 - 使用 ImageMagick 或 jpegoptim

echo "🗜️ 开始压缩图片..."
echo ""

# 检查可用的压缩工具
if command -v convert &> /dev/null; then
    TOOL="imagemagick"
    echo "✅ 使用 ImageMagick"
elif command -v jpegoptim &> /dev/null; then
    TOOL="jpegoptim"
    echo "✅ 使用 jpegoptim"
elif command -v ffmpeg &> /dev/null; then
    TOOL="ffmpeg"
    echo "✅ 使用 ffmpeg"
else
    echo "❌ 错误：未找到图片压缩工具"
    echo ""
    echo "请安装以下工具之一："
    echo "  - ImageMagick: brew install imagemagick (Mac) 或 apt install imagemagick (Linux)"
    echo "  - jpegoptim: brew install jpegoptim (Mac) 或 apt install jpegoptim (Linux)"
    exit 1
fi

echo ""

# 压缩所有图片
for file in public/generators/*.jpg; do
    if [ ! -f "$file" ]; then
        continue
    fi

    filename=$(basename "$file")
    original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    original_kb=$((original_size / 1024))

    # 如果小于 500KB，跳过
    if [ $original_kb -lt 500 ]; then
        echo "✅ $filename - ${original_kb}KB (无需压缩)"
        continue
    fi

    echo "🗜️  压缩 $filename (${original_kb}KB)..."

    # 备份原文件
    cp "$file" "${file}.backup"

    # 根据工具选择压缩方法
    case $TOOL in
        imagemagick)
            # 使用 ImageMagick 压缩
            convert "$file" -quality 85 -resize '1600x900>' -strip "${file}.tmp"
            mv "${file}.tmp" "$file"
            ;;
        jpegoptim)
            # 使用 jpegoptim 压缩
            jpegoptim --max=85 --strip-all "$file"
            ;;
        ffmpeg)
            # 使用 ffmpeg 压缩
            ffmpeg -i "$file" -q:v 2 -vf scale=1600:900 "${file}.tmp" -y 2>/dev/null
            mv "${file}.tmp" "$file"
            ;;
    esac

    # 检查压缩后的大小
    new_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    new_kb=$((new_size / 1024))
    saved=$((original_kb - new_kb))
    percent=$((saved * 100 / original_kb))

    echo "   ✅ 压缩完成：${original_kb}KB → ${new_kb}KB (节省 ${saved}KB / ${percent}%)"
    echo ""
done

echo ""
echo "🎉 所有图片压缩完成！"
echo ""
echo "📊 最终文件列表："
ls -lh public/generators/*.jpg 2>/dev/null
echo ""
echo "💡 如果满意，可以删除备份文件："
echo "   rm public/generators/*.backup"
