#!/usr/bin/env python3
"""
Bible Verse Generator - Image Downloader & Compressor
Downloads images from Unsplash and compresses to <200KB
"""

import os
import sys
import time
import requests
from PIL import Image
from io import BytesIO

# Image keywords (only for damaged images)
IMAGES = {
    "hope": "hope,sunrise,light,dawn,inspiration",
    "strength": "mountain,strength,courage,power,peak",
    "peace": "peace,calm,water,lake,serene",
    "grief": "candle,memorial,comfort,light,peaceful",
    "john": "cross,light,spiritual,faith,bible",
    "prayer": "praying,hands,prayer,worship,faith",
    "encouragement": "sunrise,motivation,hope,light,inspiration",
    "thanksgiving": "autumn,thanksgiving,harvest,gratitude,fall"
}

TARGET_SIZE_KB = 200
OUTPUT_DIR = "public/generators"

def download_image(name, keywords):
    """Download random image from Unsplash"""
    print(f"\n📷 {name.capitalize()}")
    print(f"   Keywords: {keywords}")

    # Unsplash Source API - gets random image
    url = f"https://source.unsplash.com/1600x900/?{keywords}"

    try:
        print("   ⬇️  Downloading...")
        response = requests.get(url, timeout=30, allow_redirects=True)
        response.raise_for_status()

        # Load image
        img = Image.open(BytesIO(response.content))

        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')

        original_size = len(response.content)
        print(f"   ✓ Downloaded: {img.size[0]}x{img.size[1]} ({original_size//1024}KB)")

        return img

    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return None

def compress_image(img, output_path, target_kb=TARGET_SIZE_KB):
    """Compress image to target size"""

    # Target dimensions: 1200x675 (16:9 aspect ratio)
    target_width = 1200
    target_height = 675

    # Center crop to 16:9
    img_ratio = img.size[0] / img.size[1]
    target_ratio = target_width / target_height

    if img_ratio > target_ratio:
        # Crop width
        new_width = int(img.size[1] * target_ratio)
        left = (img.size[0] - new_width) // 2
        img = img.crop((left, 0, left + new_width, img.size[1]))
    else:
        # Crop height
        new_height = int(img.size[0] / target_ratio)
        top = (img.size[1] - new_height) // 2
        img = img.crop((0, top, img.size[0], top + new_height))

    # Resize
    img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)

    # Compress to target size
    target_bytes = target_kb * 1024

    for quality in [85, 80, 75, 70, 65, 60, 55, 50]:
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=quality, optimize=True)
        size = buffer.tell()

        if size <= target_bytes or quality == 50:
            # Save
            with open(output_path, 'wb') as f:
                f.write(buffer.getvalue())

            size_kb = size / 1024
            status = "✅" if size <= target_bytes else "⚠️"
            print(f"   🗜️  Compressed: {size_kb:.1f}KB (quality {quality}) {status}")

            return True

    return False

def main():
    """Main function"""
    print("=" * 60)
    print("  Bible Verse Generator - Image Downloader & Compressor")
    print("=" * 60)
    print()

    # Check dependencies
    try:
        from PIL import Image
        import requests
    except ImportError:
        print("❌ Missing dependencies!")
        print("   Install with: pip3 install pillow requests")
        sys.exit(1)

    # Check output directory
    if not os.path.exists(OUTPUT_DIR):
        print(f"❌ Directory not found: {OUTPUT_DIR}")
        print("   Please run from project root directory")
        sys.exit(1)

    success = 0
    failed = 0

    for name, keywords in IMAGES.items():
        output_path = os.path.join(OUTPUT_DIR, f"{name}.jpg")

        # Download
        img = download_image(name, keywords)
        if img is None:
            failed += 1
            continue

        # Compress
        if compress_image(img, output_path):
            success += 1
        else:
            failed += 1

        # Small delay to be nice to Unsplash
        time.sleep(1)

    print()
    print("=" * 60)
    print(f"✅ Complete!")
    print(f"   Success: {success}/8")
    print(f"   Failed: {failed}/8")
    print()
    print(f"📁 Files saved to: {OUTPUT_DIR}/")
    print()
    print("🔍 Verify:")
    print(f"   ls -lh {OUTPUT_DIR}/*.jpg")
    print()

if __name__ == "__main__":
    main()
