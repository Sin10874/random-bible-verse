# Generator Images Guide

This directory should contain photography images for each Bible verse generator.

## Required Images

You need to add **13 images** for the following generators. All images should be high-quality photography in **landscape format** (recommended: 1200x800px or similar 3:2 ratio).

### Image Requirements:
- **Format**: JPG (preferred for smaller file size)
- **Dimensions**: 1200x800px minimum (or similar 3:2 ratio)
- **File size**: Keep under 300KB if possible (optimize for web)
- **Style**: Professional photography with natural lighting
- **Theme**: Should visually represent the generator's theme

## Image List:

### Theme-Based (6 images)
1. **love.jpg** - Warm, intimate scenes (sunset, hearts, warm colors)
   - Keywords: sunset, warm tones, couple, family, golden hour
   - Suggested sources: sunset over mountains, warm candlelight, loving embrace

2. **hope.jpg** - Uplifting, bright scenes (sunrise, rainbow, open sky)
   - Keywords: sunrise, new dawn, rainbow, bright sky, light breaking through clouds
   - Suggested sources: sunrise over ocean, rainbow after storm, light rays

3. **strength.jpg** - Powerful landscapes (mountains, storms, rocks)
   - Keywords: mountains, peaks, strong trees, rocky cliffs, powerful waves
   - Suggested sources: mountain peaks, strong oak tree, powerful waterfall

4. **peace.jpg** - Calm, serene scenes (still water, gentle landscapes)
   - Keywords: calm lake, peaceful meadow, gentle streams, quiet forest
   - Suggested sources: mirror-like lake, peaceful valley, tranquil garden

5. **faith.jpg** - Aspirational scenes (sky, stars, reaching upward)
   - Keywords: starry sky, hands reaching up, person on mountain top
   - Suggested sources: night sky with stars, person praying silhouette, cathedral light

6. **grief.jpg** - Somber but hopeful (rainy scenes, gentle light)
   - Keywords: rain, gentle light, single candle, memorial, soft colors
   - Suggested sources: rain on window, candle in darkness, autumn scene

### Book-Based (3 images)
7. **psalms.jpg** - Worship imagery (raised hands, musical, joyful)
   - Keywords: worship, music, hands raised, joy, singing
   - Suggested sources: musical instruments, worship hands silhouette, joyful nature

8. **proverbs.jpg** - Wisdom imagery (ancient paths, library, scrolls)
   - Keywords: old books, wise owl, ancient path, thoughtful scenes
   - Suggested sources: old library, forest path, wise symbols

9. **john.jpg** - Light and life imagery (bright light, living water)
   - Keywords: bright light, flowing water, life, radiance
   - Suggested sources: bright sunlight, flowing river, vibrant landscape

### Scenario-Based (4 images)
10. **prayer.jpg** - Contemplative scenes (hands folded, quiet moments)
    - Keywords: praying hands, quiet reflection, dawn, solitude
    - Suggested sources: praying hands, person in nature praying, peaceful morning

11. **encouragement.jpg** - Uplifting scenes (sunrise, breakthrough, victory)
    - Keywords: breakthrough, victory, sunrise, upward movement
    - Suggested sources: person on summit, breakthrough light, encouraging nature

12. **comfort.jpg** - Soothing scenes (soft blanket, warm drink, gentle embrace)
    - Keywords: cozy, warm, gentle, soft, comforting
    - Suggested sources: warm fireplace, cozy blanket, gentle morning light

13. **thanksgiving.jpg** - Grateful scenes (harvest, abundance, family table)
    - Keywords: harvest, abundance, table setting, autumn colors
    - Suggested sources: harvest table, autumn bounty, family gathering

## Free Image Sources:

### Recommended Websites:
1. **Unsplash** (https://unsplash.com) - Free high-quality photos
   - Search terms match the keywords above
   - Download in "Large" size for best quality

2. **Pexels** (https://www.pexels.com) - Free stock photos
   - Great selection of nature and lifestyle photos

3. **Pixabay** (https://pixabay.com) - Free images
   - Good for conceptual and nature photography

### Search Tips:
- Use the keywords listed above for each theme
- Look for images with good contrast (text will overlay)
- Prefer images with clear focal points
- Avoid busy backgrounds where text might be hard to read

## How to Add Images:

1. Download your chosen images
2. Rename them according to the list above (e.g., `love.jpg`, `hope.jpg`)
3. Optimize them for web (use tools like TinyPNG or ImageOptim)
4. Place them in this directory (`/public/generators/`)
5. Update the image paths in `/app/data/generators.ts` from `/mountain-hero.jpg` to `/generators/{name}.jpg`

## Current Status:
⚠️ **Temporary**: All generators currently use `/mountain-hero.jpg` as a placeholder. Replace with themed images for better user experience and SEO.

## License Reminder:
Make sure all images are:
- ✅ Free for commercial use
- ✅ No attribution required (preferred)
- ✅ You have rights to use them on your website

Always check the license before using any image!
