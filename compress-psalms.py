#!/usr/bin/env python3
from PIL import Image
import os

filepath = "public/generators/psalms.jpg"
img = Image.open(filepath)

print(f"Original: {img.size[0]}x{img.size[1]} ({os.path.getsize(filepath)//1024}KB)")

# Convert to RGB if needed
if img.mode in ('RGBA', 'LA', 'P'):
    img = img.convert('RGB')

# Resize to 1200x675
img = img.resize((1200, 675), Image.Resampling.LANCZOS)

# Compress
for quality in [80, 75, 70, 65, 60]:
    img.save(filepath, format='JPEG', quality=quality, optimize=True)
    size = os.path.getsize(filepath) / 1024
    if size <= 200 or quality == 60:
        print(f"Compressed: {size:.1f}KB (quality {quality})")
        break

print("✅ Done!")
