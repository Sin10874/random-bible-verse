# 📸 图片替换指南

## 当前状态

✅ **已完成：**
- 创建了 13 个 SVG 占位符图片
- 每个图片都有主题相关的渐变色背景
- 显示 emoji 图标和标题
- 所有图片 < 2KB，加载速度快
- 网站可以正常显示和使用

⚠️ **待完成：**
- 将 SVG 占位符替换为真实的 Unsplash 照片

---

## 🎨 当前占位符

所有占位符图片位于 `/public/generators/` 目录：

| 文件名 | 主题 | 颜色 | Emoji |
|--------|------|------|-------|
| love.svg | Bible Verses About Love | 红色/粉色 | ❤️ |
| hope.svg | Bible Verses About Hope | 橙色 | 🌅 |
| strength.svg | Bible Verses About Strength | 灰色 | ⛰️ |
| peace.svg | Bible Verses About Peace | 蓝紫色 | 🕊️ |
| faith.svg | Bible Verses About Faith | 深蓝色 | ✨ |
| grief.svg | Bible Verses About Grief | 灰色 | 🌧️ |
| psalms.svg | Bible Verses from Psalms | 紫色 | 🙌 |
| proverbs.svg | Bible Verses from Proverbs | 棕色 | 📖 |
| john.svg | Bible Verses from John | 金色 | 💡 |
| prayer.svg | Bible Verses About Prayer | 紫色 | 🙏 |
| encouragement.svg | Bible Verses About Encouragement | 青色 | 🎯 |
| comfort.svg | Bible Verses About Comfort | 橙色 | 🔥 |
| thanksgiving.svg | Bible Verses About Thanksgiving | 橙棕色 | 🍂 |

---

## 🔄 如何替换为真实 Unsplash 照片

### 方案 A：自动下载（推荐）

**在您的本地机器上运行：**

```bash
# 1. 进入项目目录
cd /path/to/random-bible-verse

# 2. 运行下载脚本
node download-unsplash-images.js

# 3. 如果图片过大，运行压缩脚本
./compress-images.sh
```

**下载脚本会：**
- 从 Unsplash 下载 13 张高质量照片
- 自动命名为 love.jpg, hope.jpg 等
- 检查文件大小并提示是否需要压缩
- 保存到 `public/generators/` 目录

**压缩脚本会：**
- 检测可用的压缩工具（ImageMagick、jpegoptim 等）
- 将大于 500KB 的图片压缩到合适大小
- 保持高质量（85% 质量）
- 自动备份原文件

---

### 方案 B：手动下载

如果自动脚本无法运行，请参考详细指南：

📖 **查看完整指南：** `PHOTO_DOWNLOAD_GUIDE.md`

**快速步骤：**

1. **访问 Unsplash 集合**（所有链接见 PHOTO_DOWNLOAD_GUIDE.md）
2. **选择照片** - 横向构图，高质量，主题匹配
3. **下载** - 点击 "Download free" 按钮
4. **重命名** - 改为对应的文件名（如 love.jpg）
5. **移动** - 放到 `public/generators/` 目录
6. **压缩**（如需要）- 使用 https://tinypng.com

**完成后，您需要更新代码中的文件扩展名：**

```bash
# 将 app/data/generators.ts 中的 .svg 改回 .jpg
# 或者使用以下命令：
sed -i 's/\.svg/.jpg/g' app/data/generators.ts
```

---

## 📏 图片要求

为了获得最佳显示效果，请确保下载的图片符合以下要求：

✅ **必须：**
- 格式：JPG 或 PNG
- 方向：横向（Landscape）
- 最小尺寸：1200x800px（3:2 比例）
- 文件大小：< 500KB（推荐）

✅ **推荐：**
- 构图：有留白空间（方便叠加文字）
- 光线：柔和自然光，避免过曝或过暗
- 风格：统一的色调和风格
- 质量：高分辨率，清晰锐利

---

## 🛠️ 工具和脚本

项目中提供了以下工具脚本：

### 1. `download-unsplash-images.js`
**功能：** 自动从 Unsplash 下载所有 13 张图片

```bash
node download-unsplash-images.js
```

**输出：**
- 下载进度显示
- 文件大小检查
- 成功/失败统计
- 压缩建议

---

### 2. `compress-images.sh`
**功能：** 压缩大于 500KB 的图片

```bash
./compress-images.sh
```

**支持的工具：**
- ImageMagick (`convert`)
- jpegoptim
- ffmpeg

**自动：**
- 检测可用工具
- 备份原文件
- 优化到 85% 质量
- 报告压缩比例

---

### 3. `create-placeholder-images.js`
**功能：** 创建 SVG 占位符图片（已完成）

```bash
node create-placeholder-images.js
```

**用途：**
- 初始开发和测试
- 临时占位符
- 快速预览布局

---

### 4. `download-images.sh`
**功能：** Bash 版本的下载脚本（备用）

```bash
./download-images.sh
```

**使用场景：**
- Node.js 不可用时
- 需要 curl 直接下载时

---

## 🧪 测试图片

下载/替换图片后，请测试：

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问网站
http://localhost:3000

# 3. 检查项目
✅ 向下滚动到 Trending Generators
✅ 所有 13 张图片都正常显示
✅ 图片清晰，无模糊
✅ 加载速度快（< 2 秒）
✅ 响应式布局正常（手机、平板、电脑）
```

---

## 📊 文件对比

### SVG 占位符（当前）
- **优点：** 文件小（~1KB），加载快，可缩放，颜色标识清晰
- **缺点：** 不是真实照片，视觉效果简单
- **用途：** 开发和测试阶段

### JPG 照片（目标）
- **优点：** 真实照片，视觉效果好，专业外观
- **缺点：** 文件较大（100-500KB），需要优化
- **用途：** 生产环境

---

## 🚀 部署前检查

在部署到生产环境前，确保：

- [ ] 所有 13 张图片都已替换为真实照片
- [ ] 所有图片文件 < 500KB
- [ ] `app/data/generators.ts` 中的扩展名已更新（.jpg 或 .png）
- [ ] 本地测试通过
- [ ] 图片在所有设备上显示正常
- [ ] 图片符合主题和风格
- [ ] 已删除 .svg 占位符文件（可选）

---

## 💡 小技巧

### 压缩图片
如果没有安装 ImageMagick 等工具，可以使用在线服务：

- **TinyPNG:** https://tinypng.com （推荐）
- **Squoosh:** https://squoosh.app
- **Compressor.io:** https://compressor.io

### 选择照片
选择照片时注意：

1. **留白空间** - 为文字叠加预留空间（通常在中间或下方 1/3）
2. **主题相关** - 图片内容应与主题相关
3. **情感色调** - Love 用温暖色，Peace 用冷静色
4. **避免人脸** - 除非必要，避免人脸特写（分散注意力）
5. **版权安全** - 仅使用 Unsplash 或其他免费商用图片

### Unsplash License
所有 Unsplash 图片：
- ✅ 免费用于商业和非商业用途
- ✅ 无需署名（但推荐）
- ✅ 可以修改和重新分发
- ❌ 不能直接转售原图
- ❌ 不能声称版权

---

## 📚 相关文档

- **PHOTO_DOWNLOAD_GUIDE.md** - 完整的 Unsplash 下载指南
- **UNSPLASH_GUIDE.md** - 简化版下载指南
- **TROUBLESHOOTING.md** - 问题排查指南
- **QUICK_TEST.md** - 快速测试指南

---

## ❓ 常见问题

### Q: 为什么使用 SVG 占位符而不是 JPG？
**A:** 因为网络限制，无法在服务器端直接下载 Unsplash 图片。SVG 占位符确保网站可以立即运行和测试。

### Q: 我必须使用 Unsplash 吗？
**A:** 不必须。您可以使用任何免费商用图片，只要符合尺寸和质量要求。其他选择包括 Pexels、Pixabay 等。

### Q: 可以保留 SVG 占位符吗？
**A:** 可以，但不推荐用于生产环境。SVG 占位符适合开发测试，但真实照片会提供更好的用户体验。

### Q: 如何批量压缩图片？
**A:** 使用提供的 `compress-images.sh` 脚本，或者使用在线工具如 TinyPNG 的批量压缩功能。

### Q: 图片不显示怎么办？
**A:** 检查：
1. 文件是否在 `public/generators/` 目录
2. 文件名是否正确（小写，无空格）
3. `generators.ts` 中的扩展名是否匹配
4. 开发服务器是否重启

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 **TROUBLESHOOTING.md**
2. 检查控制台错误信息
3. 确认文件路径和权限
4. 尝试重启开发服务器

---

**祝您顺利替换图片！** 🎉
