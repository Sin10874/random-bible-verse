#!/usr/bin/env python3
"""
Batch Image Compressor - Compress images to <200KB
"""

import os
from PIL import Image

# Images to compress
IMAGES = [
    "thanksgiving.jpg",
    "proverbs.jpg", 
    "prayer.jpg",
    "john.jpg",
    "grief.jpg",
    "encouragement.jpg",
    "strength.jpg",
    "peace.jpg"
]

TARGET_SIZE_KB = 200
IMAGE_DIR = "public/generators"

def compress_image(filename):
    """Compress single image"""
    filepath = os.path.join(IMAGE_DIR, filename)
    
    if not os.path.exists(filepath):
        print(f"❌ {filename} - File not found")
        return False
    
    # Load image
    img = Image.open(filepath)
    
    # Get original size
    original_size = os.path.getsize(filepath) / 1024
    print(f"\n📷 {filename}")
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
        img.save(filepath, format='JPEG', quality=quality, optimize=True)
        size = os.path.getsize(filepath)
        
        if size <= target_bytes or quality == 45:
            size_kb = size / 1024
            status = "✅" if size <= target_bytes else "⚠️"
            print(f"   Compressed: {size_kb:.1f}KB (quality {quality}) {status}")
            return True
    
    return False

def main():
    print("=" * 60)
    print("  Batch Image Compressor - Target: <200KB")
    print("=" * 60)
    
    if not os.path.exists(IMAGE_DIR):
        print(f"❌ Directory not found: {IMAGE_DIR}")
        return
    
    success = 0
    failed = 0
    
    for filename in IMAGES:
        if compress_image(filename):
            success += 1
        else:
            failed += 1
    
    print()
    print("=" * 60)
    print(f"✅ Complete!")
    print(f"   Success: {success}/{len(IMAGES)}")
    print(f"   Failed: {failed}/{len(IMAGES)}")
    print()
    print("🔍 Verify sizes:")
    print(f"   ls -lh {IMAGE_DIR}/*.jpg")
    print()

if __name__ == "__main__":
    main()
