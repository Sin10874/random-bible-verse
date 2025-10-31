# 多语言架构迁移详细计划

## 🎯 迁移目标

将现有的单语言（英语）网站重构为支持多语言的架构，使用 next-intl 的最佳实践。

---

## 📊 当前目录结构 vs 目标结构

### 当前结构（单语言）

```
app/
├── layout.tsx                    # 根布局（包含metadata、GA等）
├── page.tsx                      # 主页
├── globals.css                   # 全局样式
├── favicon.ico                   # 图标
├── icon.png                      # 图标
├── api/
│   └── verse/
│       └── route.ts              # API路由
├── data/
│   └── generators.ts             # 生成器配置
├── [slug]/                       # 动态路由：生成器页面
│   ├── layout.tsx
│   └── page.tsx
├── pornography-prayer-points-with-scriptures/
│   ├── layout.tsx
│   └── page.tsx
└── privacy/
    └── page.tsx

当前 URL 示例：
✓ /
✓ /love-bible-verses
✓ /pornography-prayer-points-with-scriptures
```

### 目标结构（多语言）

```
app/
├── layout.tsx                    # 根布局（保持不变）
├── globals.css                   # 全局样式（保持不变）
├── favicon.ico                   # 图标（保持不变）
├── icon.png                      # 图标（保持不变）
├── api/                          # API（保持不变）
│   └── verse/
│       └── route.ts
├── data/                         # 数据（保持不变）
│   └── generators.ts
└── [locale]/                     # 🆕 新增：动态语言路由
    ├── layout.tsx                # 🆕 多语言布局
    ├── page.tsx                  # ← 从 app/page.tsx 移过来
    ├── [slug]/                   # ← 从 app/[slug] 移过来
    │   ├── layout.tsx
    │   └── page.tsx
    ├── pornography-prayer-points-with-scriptures/  # ← 移过来
    │   ├── layout.tsx
    │   └── page.tsx
    └── privacy/                  # ← 移过来
        └── page.tsx

新的 URL 示例：
✓ /                               # 英语主页（默认）
✓ /es                             # 西班牙语主页
✓ /love-bible-verses              # 英语
✓ /es/love-bible-verses           # 西班牙语
✓ /pt/love-bible-verses           # 葡萄牙语
✓ /zh/love-bible-verses           # 中文
```

---

## 📋 需要执行的操作清单

### 第1步：创建新的目录结构

**新建文件夹**：
```bash
mkdir -p app/[locale]
```

### 第2步：移动页面文件

**需要移动的文件**：

| 源文件 | 目标文件 | 说明 |
|-------|---------|------|
| `app/page.tsx` | `app/[locale]/page.tsx` | 主页 |
| `app/[slug]/` | `app/[locale]/[slug]/` | 生成器页面（整个文件夹） |
| `app/pornography-prayer-points-with-scriptures/` | `app/[locale]/pornography-prayer-points-with-scriptures/` | 祷告页面 |
| `app/privacy/` | `app/[locale]/privacy/` | 隐私页面 |

**保持不变的文件**：
- ✅ `app/layout.tsx` - 根布局
- ✅ `app/globals.css` - 样式
- ✅ `app/favicon.ico` - 图标
- ✅ `app/icon.png` - 图标
- ✅ `app/api/` - API路由
- ✅ `app/data/` - 数据文件

### 第3步：创建新的多语言布局

**新建文件**：`app/[locale]/layout.tsx`

这个文件将：
- 接收 `locale` 参数
- 从 next-intl 获取翻译
- 包装所有多语言页面

### 第4步：修改根布局

**修改文件**：`app/layout.tsx`

需要添加：
- next-intl 的 `NextIntlClientProvider`
- 语言参数传递

### 第5步：更新所有页面的导入

**需要修改的文件**：
- `app/[locale]/page.tsx`
- `app/[locale]/[slug]/page.tsx`
- `app/[locale]/pornography-prayer-points-with-scriptures/page.tsx`
- `app/[locale]/privacy/page.tsx`

**需要修改的内容**：
- 添加 `useTranslations` hook
- 将硬编码的英文文案替换为翻译 key
- 添加 `locale` 参数处理

### 第6步：更新 next.config.ts

**修改文件**：`next.config.ts`

需要添加 next-intl 插件配置。

### 第7步：创建语言切换器组件

**新建文件**：`app/[locale]/components/LanguageSwitcher.tsx`

功能：
- 显示当前语言
- 下拉菜单选择其他语言
- 切换时保持在同一页面

---

## 🔧 详细的文件修改内容

### 修改1：app/layout.tsx（根布局）

**当前内容（简化）**：
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {/* Google Analytics */}
      </body>
    </html>
  );
}
```

**修改后**：
```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 验证语言参数
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        {/* Google Analytics - 保持不变 */}
      </body>
    </html>
  );
}
```

**关键变化**：
- ✅ 添加 `NextIntlClientProvider`
- ✅ 从 `params` 获取 `locale`
- ✅ 动态设置 `<html lang={locale}>`
- ✅ 验证语言参数有效性

---

### 修改2：新建 app/[locale]/layout.tsx

```tsx
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 验证语言
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return children;
}

// 生成静态参数（支持的所有语言）
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

**作用**：
- ✅ 为每种语言生成静态路由
- ✅ 验证语言参数
- ✅ 包装所有多语言页面

---

### 修改3：app/[locale]/page.tsx（主页）

**需要修改的内容示例**：

**修改前**：
```tsx
<h1 className="...">Bible Verse Generator</h1>
<p className="...">Trust God.</p>
<button className="...">Random Bible Verse</button>
```

**修改后**：
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations();

  return (
    <>
      <h1 className="...">{t('common.siteName')}</h1>
      <p className="...">{t('home.heroTitle')}</p>
      <button className="...">{t('home.generateButton')}</button>
    </>
  );
}
```

**关键变化**：
- ✅ 导入 `useTranslations`
- ✅ 用 `t('key')` 替换硬编码文案
- ✅ 翻译 key 对应 `i18n/messages/en.json` 中的结构

---

### 修改4：next.config.ts

**当前内容**：
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bibleverse-generator.org' }],
        destination: 'https://bibleverse-generator.org/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

**修改后**：
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bibleverse-generator.org' }],
        destination: 'https://bibleverse-generator.org/:path*',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
```

**关键变化**：
- ✅ 导入 `createNextIntlPlugin`
- ✅ 用 `withNextIntl` 包装配置
- ✅ 指向 i18n request 配置

---

## ⚠️ 潜在风险和注意事项

### 风险1：开发服务器可能报错

**问题**：
- 移动文件过程中，Next.js 开发服务器会检测到文件变化
- 可能会出现 404 或模块未找到错误

**解决方案**：
- 🛑 执行前先关闭 `npm run dev`
- ✅ 完成所有迁移后再重启
- ✅ 如果仍有错误，删除 `.next` 文件夹重新构建

### 风险2：导入路径可能失效

**问题**：
- 文件移动后，相对导入路径会改变
- 例如：`import { GENERATORS } from '../data/generators'` 可能失效

**解决方案**：
- ✅ 检查所有导入语句
- ✅ 使用 TypeScript 编译器检测错误
- ✅ 可能需要更新为 `'@/app/data/generators'`

### 风险3：metadata 可能需要重新配置

**问题**：
- 每个语言需要不同的 metadata（title、description等）

**解决方案**：
- ✅ 在 `app/[locale]/layout.tsx` 中动态生成 metadata
- ✅ 根据 `locale` 返回对应语言的 SEO 信息
- ✅ 后续阶段实现

---

## 🧪 测试计划

### 迁移完成后需要测试：

#### 1. 英语路由（默认）
- [ ] `/` - 主页正常显示
- [ ] `/love-bible-verses` - 生成器正常工作
- [ ] `/pornography-prayer-points-with-scriptures` - 祷告页正常
- [ ] `/privacy` - 隐私页正常

#### 2. 西班牙语路由
- [ ] `/es` - 西语主页显示西班牙语文案
- [ ] `/es/love-bible-verses` - 西语生成器页面
- [ ] 所有文案都是西班牙语

#### 3. 语言切换
- [ ] 切换语言后停留在当前页面
- [ ] URL 正确变化（如 `/love` → `/es/love`）
- [ ] 文案立即更新

#### 4. API 路由
- [ ] `/api/verse` - API 仍然正常工作
- [ ] 返回的数据格式正确

#### 5. 构建测试
```bash
npm run build
```
- [ ] 构建成功无错误
- [ ] 生成所有语言的静态页面

---

## 📊 迁移步骤执行顺序

### 阶段1：准备工作（5分钟）
1. ✅ 停止开发服务器 `Ctrl+C`
2. ✅ 备份当前代码（可选）：`git stash`
3. ✅ 确认所有更改已提交

### 阶段2：目录重构（10分钟）
1. 创建 `app/[locale]` 文件夹
2. 移动页面文件
3. 创建新的 layout 文件

### 阶段3：代码修改（15分钟）
1. 修改 `app/layout.tsx`
2. 修改 `app/[locale]/page.tsx`
3. 修改 `next.config.ts`
4. 更新所有导入路径

### 阶段4：测试验证（10分钟）
1. 删除 `.next` 文件夹
2. 重启开发服务器
3. 测试英语路由
4. 测试西班牙语路由
5. 测试语言切换

### 阶段5：修复问题（10分钟）
1. 解决任何导入错误
2. 修复 TypeScript 类型错误
3. 验证所有功能正常

**总预计时间**：50分钟

---

## 🎯 执行前检查清单

开始迁移前，请确认：

- [ ] 你已经 review 了这个迁移计划
- [ ] 你理解了目录结构的变化
- [ ] 你知道哪些文件会被移动
- [ ] 你知道哪些文件会被修改
- [ ] 你已经关闭了开发服务器
- [ ] （可选）你已经备份了代码

---

## ❓ 常见问题

### Q1: 为什么不能保持 app/page.tsx 不动，只添加 app/[locale]？

**A**: 因为 Next.js 的路由优先级规则：
- `/` 会匹配 `app/page.tsx`（精确匹配）
- `/es` 会匹配 `app/[locale]/page.tsx`（动态匹配）
- 但这样会导致英语和其他语言使用不同的代码结构
- 不利于维护和一致性

**正确做法**：
- 所有语言（包括英语）都使用 `app/[locale]`
- 英语作为默认语言，URL 不带前缀（通过 middleware 实现）

### Q2: API 路由需要移动吗？

**A**: 不需要 ❌
- API 路由在 `app/api/` 下保持不变
- API 通常不需要国际化
- 如果需要返回不同语言的数据，在 API 内部处理

### Q3: 静态资源（图片、CSS）需要移动吗？

**A**: 不需要 ❌
- `public/` 文件夹保持不变
- `app/globals.css` 保持不变
- `favicon.ico` 等保持不变
- 这些资源对所有语言共享

### Q4: 迁移后 SEO 会受影响吗？

**A**: 不会，反而会更好 ✅
- 英语 URL 保持不变（`/` 和 `/love-bible-verses`）
- 新增其他语言 URL（`/es/`, `/es/love-bible-verses`）
- Google 会通过 hreflang 理解这是多语言网站
- 后续我们会添加 hreflang 标签

### Q5: 用户会看到 404 吗？

**A**: 不会 ❌
- 英语 URL 完全保持不变
- 现有的搜索引擎索引不受影响
- 用户收藏的链接仍然有效

---

## 🚀 准备好开始了吗？

请告诉我：

1. ✅ 你已经 review 了整个迁移计划
2. ✅ 你理解了需要做的改动
3. ✅ 你准备好关闭开发服务器
4. ✅ 你确认可以开始执行

**如果有任何疑问，请现在提出！**

确认后，我会按照上述计划逐步执行，并实时报告进度。
