#!/usr/bin/env python3
"""
Convert PNG to proper ICO format for favicon
"""

from PIL import Image
import sys

def convert_png_to_ico(png_path, ico_path, sizes=[(16, 16), (32, 32), (48, 48)]):
    """
    Convert PNG to ICO with multiple sizes

    Args:
        png_path: Path to source PNG file
        ico_path: Path to output ICO file
        sizes: List of (width, height) tuples for ICO sizes
    """
    try:
        img = Image.open(png_path)

        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')

        # Create icon with multiple sizes
        icon_sizes = []
        for size in sizes:
            resized = img.resize(size, Image.Resampling.LANCZOS)
            icon_sizes.append(resized)

        # Save as ICO
        icon_sizes[0].save(
            ico_path,
            format='ICO',
            sizes=sizes,
            append_images=icon_sizes[1:]
        )

        print(f"✅ Successfully converted {png_path} to {ico_path}")
        print(f"   Sizes included: {sizes}")
        return True

    except Exception as e:
        print(f"❌ Error converting {png_path}: {str(e)}")
        return False

if __name__ == "__main__":
    # Convert app/icon.png to app/favicon.ico
    print("Converting PNG files to proper ICO format...\n")

    # Convert for app directory (Next.js automatic favicon)
    success1 = convert_png_to_ico(
        "app/icon.png",
        "app/favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48)]
    )

    # Also create one in public for direct access
    success2 = convert_png_to_ico(
        "public/favicon.png",
        "public/favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )

    if success1 and success2:
        print("\n✅ All conversions completed successfully!")
        print("\nNext steps:")
        print("1. Deploy the updated files to production")
        print("2. Clear your browser cache (Cmd+Shift+R)")
        print("3. Wait 24-48 hours for Google to update the search results")
        print("4. Use Google Search Console to request re-indexing")
    else:
        print("\n❌ Some conversions failed. Please check the errors above.")
        sys.exit(1)
