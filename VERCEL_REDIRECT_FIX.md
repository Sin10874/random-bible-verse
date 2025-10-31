# 修复 Vercel 域名重定向冲突

## 🔴 问题诊断

**当前 Vercel 配置**：
```
bibleverse-generator.org → 307 → www.bibleverse-generator.org
```

**代码配置**：
```
metadataBase: "https://bibleverse-generator.org"
Next.js 重定向: www → bibleverse-generator.org
```

**冲突**：Vercel 和代码的重定向方向相反！

---

## ✅ 解决方案

使用 **非 www** 版本（`bibleverse-generator.org`）作为规范域名。

---

## 📋 详细操作步骤

### 步骤1：登录 Vercel Dashboard

1. 访问：https://vercel.com/login
2. 登录账号
3. 进入项目：**random-bible-verse**

### 步骤2：进入域名设置

1. 点击顶部 **Settings**
2. 左侧菜单点击 **Domains**

### 步骤3：找到重定向配置

你应该看到类似这样的界面：

```
Domains
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ bibleverse-generator.org
  → Redirect to www.bibleverse-generator.org (307)     ← 这是问题！

✓ www.bibleverse-generator.org
  Production
```

### 步骤4：编辑非 www 域名

1. 找到 `bibleverse-generator.org` 这一行
2. 点击右侧的 **⋯** (三个点) 或 **Edit** 按钮
3. 会打开编辑界面

### 步骤5：移除重定向配置

在编辑界面中：

**方式A：如果看到 "Redirect to" 下拉菜单**：
1. 找到 **"Redirect to"** 选项
2. 当前应该显示：`www.bibleverse-generator.org`
3. 将其改为：**"None"** 或 **"No redirect"**
4. 或者：选择 **"Production"**（表示这是主域名，不重定向）
5. 点击 **Save** 保存

**方式B：如果看到单选按钮**：
1. 找到类似这样的选项：
   ```
   ○ Redirect to another domain
   ● Assign to Production  ← 选择这个
   ```
2. 确保选中 **"Assign to Production"**
3. 点击 **Save**

**方式C：如果看到复选框**：
1. 找到 **"Redirect"** 复选框
2. **取消勾选** 这个复选框
3. 点击 **Save**

### 步骤6：配置 www 域名重定向（可选）

现在处理 `www.bibleverse-generator.org`：

**选项A：删除 www 域名**（推荐）
1. 找到 `www.bibleverse-generator.org` 这一行
2. 点击 **⋯** → **Remove**
3. 确认删除
4. ✅ 最简单，Next.js 代码会处理重定向

**选项B：设置 www 重定向到非 www**
1. 找到 `www.bibleverse-generator.org` 这一行
2. 点击 **Edit**
3. 设置 **Redirect to**: `bibleverse-generator.org`
4. 选择 **Permanent** (308 或 301)
5. 点击 **Save**

### 步骤7：验证最终配置

配置完成后，域名列表应该显示：

**如果删除了 www**：
```
Domains
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ bibleverse-generator.org        Production
✓ random-bible-verse.vercel.app   Production
```

**如果保留了 www 并设置重定向**：
```
Domains
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ bibleverse-generator.org                Production
✓ www.bibleverse-generator.org
  → Redirect to bibleverse-generator.org (308)
✓ random-bible-verse.vercel.app           Production
```

---

## 🧪 测试验证

### 测试1：非 www 版本（主域名）

1. 打开无痕窗口
2. 访问：`https://bibleverse-generator.org`
3. ✅ 地址栏应该保持为：`https://bibleverse-generator.org`（不跳转）
4. ✅ 页面正常显示

### 测试2：www 版本（应该重定向）

1. 在无痕窗口访问：`https://www.bibleverse-generator.org`
2. ✅ 地址栏应该自动变为：`https://bibleverse-generator.org`
3. ✅ 页面正常显示

### 测试3：命令行验证

```bash
# 测试非 www - 应该返回 200
curl -I https://bibleverse-generator.org

# 预期结果：
# HTTP/2 200 OK

# 测试 www - 应该返回 308 重定向
curl -I https://www.bibleverse-generator.org

# 预期结果：
# HTTP/2 308
# location: https://bibleverse-generator.org/
```

---

## ⚠️ 可能遇到的界面情况

### 情况1：Vercel 新版界面

你可能看到这样的界面：

```
bibleverse-generator.org

Git Branch: main (Production)
Redirect: www.bibleverse-generator.org  ← 删除这个

[Edit Domain]  [Remove Domain]
```

**操作**：
1. 点击 **Edit Domain**
2. 找到 **Redirect** 部分
3. 删除 `www.bibleverse-generator.org`
4. 或者切换到 **Production** 模式

### 情况2：Vercel 旧版界面

```
Domain                        Branch/Redirect
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bibleverse-generator.org      → www.bibleverse-generator.org  [Edit]
```

**操作**：
1. 点击 **Edit**
2. 选择 **"Use as Production Domain"**
3. 保存

### 情况3：下拉菜单界面

```
bibleverse-generator.org

Assign to:
[▼ Redirect to www.bibleverse-generator.org]  ← 点击下拉菜单

选项：
- Production Branch (main)          ← 选择这个
- Redirect to another domain
- Preview Deployments
```

---

## 🎯 为什么选择非 www 作为主域名？

### 原因1：与现有配置一致
- ✅ Sitemap 使用：`https://bibleverse-generator.org`
- ✅ robots.txt 使用：`https://bibleverse-generator.org`
- ✅ Google Analytics 可能已经记录了非 www 的数据

### 原因2：更简洁
- ✅ 用户输入更方便：`bibleverse-generator.org`
- ✅ 品牌展示更简洁
- ✅ 大多数现代网站选择非 www（如 google.com, facebook.com）

### 原因3：SEO 优势
- ✅ URL 更短，用户体验更好
- ✅ 减少一次 DNS 查询
- ✅ 避免子域名的复杂性

---

## 🔄 如果你更喜欢用 www 版本

如果你坚持要用 `www.bibleverse-generator.org` 作为主域名，需要：

### 修改代码配置

1. **修改 `app/layout.tsx`**：
   ```typescript
   metadataBase: new URL("https://www.bibleverse-generator.org"),
   ```

2. **修改 `next.config.ts`**：
   ```typescript
   {
     source: '/:path*',
     has: [
       {
         type: 'host',
         value: 'bibleverse-generator.org', // 注意：这里改成非 www
       },
     ],
     destination: 'https://www.bibleverse-generator.org/:path*',
     permanent: true,
   }
   ```

3. **修改 Vercel 配置**：
   - 保持 `bibleverse-generator.org` → `www.bibleverse-generator.org` 重定向
   - 或删除非 www 域名

4. **重新生成 sitemap**：
   - 修改 `next-sitemap.config.js` 中的 `siteUrl`
   - 运行 `npm run postbuild`

**但不推荐这样做**，因为：
- 需要修改很多配置
- Sitemap 需要重新提交
- Google 可能需要重新索引所有页面

---

## ✅ 推荐操作清单

按顺序完成：

### 立即执行（5分钟）
- [ ] 1. 登录 Vercel Dashboard
- [ ] 2. 进入 Settings → Domains
- [ ] 3. 编辑 `bibleverse-generator.org`
- [ ] 4. 移除重定向配置（改为 Production）
- [ ] 5. 删除 `www.bibleverse-generator.org` 域名（或设置重定向）
- [ ] 6. 保存配置

### 10分钟后测试
- [ ] 7. 访问 `https://bibleverse-generator.org` → 应该正常显示
- [ ] 8. 访问 `https://www.bibleverse-generator.org` → 应该跳转到非 www
- [ ] 9. 使用 curl 命令验证

### 30分钟后（配置生效）
- [ ] 10. 在 Google Search Console 请求主页重新索引
- [ ] 11. 检查 www 版本状态（应显示"重定向"）

### 1-2周后监控
- [ ] 12. 检查 Search Console "重复网页"错误是否消失
- [ ] 13. 验证搜索结果只显示非 www 版本

---

## 📸 截图参考

### 编辑前（错误配置）
```
┌────────────────────────────────────────────────────────┐
│ bibleverse-generator.org                               │
│                                                        │
│ Redirect to: www.bibleverse-generator.org  ← 删除这个 │
│                                                        │
│ [Cancel]  [Save]                                       │
└────────────────────────────────────────────────────────┘
```

### 编辑后（正确配置）
```
┌────────────────────────────────────────────────────────┐
│ bibleverse-generator.org                               │
│                                                        │
│ Git Branch: main (Production)              ✓          │
│ Redirect: None                                         │
│                                                        │
│ [Cancel]  [Save]                                       │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 总结

**问题**：
- Vercel 配置：非www → www（错误）
- 代码配置：www → 非www（正确）

**解决方案**：
- ✅ 修改 Vercel：让非www成为主域名（Production）
- ✅ 删除或重定向 www 域名
- ✅ 保持代码配置不变

**预期结果**：
- 非www 是主域名（不重定向）
- www 重定向到非www
- 所有配置一致，Google 识别清晰
