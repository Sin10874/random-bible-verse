#!/usr/bin/env python3
"""
Compress hope.jpg from Desktop and save to public/generators/
"""

import os
from PIL import Image

# Paths
SOURCE = os.path.expanduser("~/Desktop/hope.jpg")
TARGET_DIR = "public/generators"
TARGET_FILE = os.path.join(TARGET_DIR, "hope.jpg")
TARGET_SIZE_KB = 200

def compress_hope():
    """Compress hope.jpg from Desktop"""

    if not os.path.exists(SOURCE):
        print(f"❌ Source file not found: {SOURCE}")
        return False

    if not os.path.exists(TARGET_DIR):
        print(f"❌ Target directory not found: {TARGET_DIR}")
        return False

    # Load image
    img = Image.open(SOURCE)

    # Get original size
    original_size = os.path.getsize(SOURCE) / 1024
    print(f"\n📷 hope.jpg")
    print(f"   Original: {img.size[0]}x{img.size[1]} ({original_size:.1f}KB)")

    # Convert to RGB if needed
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')

    # Target dimensions: 1200x675 (16:9)
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
    target_bytes = TARGET_SIZE_KB * 1024

    for quality in [85, 80, 75, 70, 65, 60, 55, 50, 45]:
        img.save(TARGET_FILE, format='JPEG', quality=quality, optimize=True)
        size = os.path.getsize(TARGET_FILE)

        if size <= target_bytes or quality == 45:
            size_kb = size / 1024
            status = "✅" if size <= target_bytes else "⚠️"
            print(f"   Compressed: {size_kb:.1f}KB (quality {quality}) {status}")
            print(f"   Saved to: {TARGET_FILE}")
            return True

    return False

def main():
    print("=" * 60)
    print("  Compress hope.jpg - Target: <200KB")
    print("=" * 60)

    if compress_hope():
        print("\n✅ Success! hope.jpg has been compressed and saved.")
    else:
        print("\n❌ Failed to compress hope.jpg")

if __name__ == "__main__":
    main()
