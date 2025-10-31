# Vercel 域名设置详细指南

## 🎯 目标

删除或重定向 `www.bibleverse-generator.org`，确保只使用 `bibleverse-generator.org` 作为规范域名。

---

## 📋 前提条件检查

开始之前，先确认：
- ✅ Vercel 已部署完成（检查 https://bibleverse-generator.org 能否访问）
- ✅ 你有 Vercel 项目的管理员权限
- ✅ 你知道域名在哪个域名服务商（Namecheap/GoDaddy/Cloudflare等）

---

## 🚀 方案一：删除 www 域名（推荐）⭐

### 为什么推荐删除？
- ✅ 最简单，不会产生配置冲突
- ✅ Next.js 的重定向代码已经处理了 www 跳转
- ✅ 减少 DNS 查询，加快访问速度
- ✅ Google 只会看到一个规范域名

### 详细步骤

#### 步骤1：登录 Vercel Dashboard

1. 打开浏览器，访问：https://vercel.com/login
2. 使用你的账号登录（GitHub/GitLab/Email）
3. 登录成功后，你会看到所有项目列表

#### 步骤2：选择项目

1. 在项目列表中找到 **random-bible-verse** 项目
2. 点击项目名称进入项目详情页
3. 确认顶部显示项目名称：`random-bible-verse`

#### 步骤3：进入域名设置

1. 在项目页面顶部，找到导航栏
2. 点击 **Settings**（设置）标签
   - 位置：通常在 Deployments（部署）旁边
3. 在左侧菜单中，点击 **Domains**（域名）
   - 如果找不到，往下滚动左侧菜单

#### 步骤4：查看当前域名配置

你应该看到类似这样的域名列表：

```
┌─────────────────────────────────────┬──────────────┬──────────┐
│ Domain                              │ Type         │ Redirect │
├─────────────────────────────────────┼──────────────┼──────────┤
│ bibleverse-generator.org            │ Production   │ -        │
│ www.bibleverse-generator.org        │ Production   │ -        │
│ random-bible-verse-xxx.vercel.app   │ Production   │ -        │
└─────────────────────────────────────┴──────────────┴──────────┘
```

或者：

```
Domain                              Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bibleverse-generator.org            ✓ Valid
www.bibleverse-generator.org        ✓ Valid
random-bible-verse-xxx.vercel.app   ✓ Valid
```

**注意观察**：
- ✅ 应该有 `bibleverse-generator.org` 这一行（不带 www）
- ✅ 应该有 `www.bibleverse-generator.org` 这一行（带 www）
- ✅ 可能还有 Vercel 自动分配的 `.vercel.app` 域名

#### 步骤5：删除 www 域名

1. **找到 www 域名行**：
   ```
   www.bibleverse-generator.org
   ```

2. **查找操作按钮**：
   - 在这一行的**最右侧**，找到三个点的菜单 **⋯** 或者 **···**
   - 或者：找到 **Edit**（编辑）或 **Remove**（移除）按钮
   - 界面可能显示为：
     - `⋯` (三个竖点)
     - `···` (三个横点)
     - `⚙️` (齿轮图标)
     - `🗑️` (垃圾桶图标)

3. **点击菜单**：
   - 点击 **⋯** 或操作按钮
   - 应该会弹出下拉菜单

4. **选择删除**：
   在下拉菜单中选择：
   - **"Remove"** 或
   - **"Delete"** 或
   - **"Remove Domain"**

5. **确认删除**：
   - Vercel 会弹出确认对话框，问你是否确定删除
   - 对话框可能显示：
     ```
     Are you sure you want to remove www.bibleverse-generator.org?
     This action cannot be undone.
     ```
   - 点击 **"Remove"** 或 **"Confirm"** 确认删除

6. **等待处理**：
   - Vercel 会显示加载动画（几秒钟）
   - 删除成功后，`www.bibleverse-generator.org` 这一行会消失

#### 步骤6：验证删除结果

删除后，域名列表应该变成：

```
┌─────────────────────────────────────┬──────────────┬──────────┐
│ Domain                              │ Type         │ Redirect │
├─────────────────────────────────────┼──────────────┼──────────┤
│ bibleverse-generator.org            │ Production   │ -        │
│ random-bible-verse-xxx.vercel.app   │ Production   │ -        │
└─────────────────────────────────────┴──────────────┴──────────┘
```

✅ **成功标志**：
- `www.bibleverse-generator.org` 不再出现在列表中
- 只剩下 `bibleverse-generator.org` 和 `.vercel.app` 域名

#### 步骤7：（可选）DNS 清理

**如果你的域名在 Namecheap/GoDaddy 等服务商**：

1. 登录域名服务商网站
2. 找到 `bibleverse-generator.org` 的 DNS 设置
3. 查找是否有 `www` 的 CNAME 记录：
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **删除这条记录**（可选）
   - 删除后，`www.bibleverse-generator.org` 完全无法访问
   - 但 Next.js 的重定向仍然会工作（如果有人配置了DNS）

**注意**：这一步是可选的，即使不删除 DNS 记录，Next.js 的重定向也会正常工作。

---

## 🔄 方案二：保留 www 但设置重定向（备选）

如果你想保留 `www.bibleverse-generator.org` 但让它重定向到非 www 版本：

### 详细步骤

#### 步骤1-4：同方案一

跟随方案一的步骤 1-4，进入域名设置页面。

#### 步骤5：编辑 www 域名

1. 找到 `www.bibleverse-generator.org` 这一行
2. 点击 **Edit**（编辑）按钮或 **⋯** 菜单
3. 选择 **"Edit"** 或 **"Configure"**

#### 步骤6：配置重定向

在编辑页面：

1. 找到 **"Redirect to"** 或 **"Redirect"** 选项
2. 在下拉菜单或输入框中选择/输入：
   ```
   bibleverse-generator.org
   ```
3. 确保选择 **"Permanent"** (永久重定向)
   - 或者：勾选 **"308 Permanent Redirect"**
   - 或者：勾选 **"301 Permanent Redirect"**
4. 点击 **"Save"** 保存

#### 步骤7：验证配置

保存后，域名列表应该显示：

```
┌─────────────────────────────────────┬──────────────┬──────────────────────────┐
│ Domain                              │ Type         │ Redirect                 │
├─────────────────────────────────────┼──────────────┼──────────────────────────┤
│ bibleverse-generator.org            │ Production   │ -                        │
│ www.bibleverse-generator.org        │ Production   │ → bibleverse-generator.org│
└─────────────────────────────────────┴──────────────┴──────────────────────────┘
```

✅ **成功标志**：
- `www.bibleverse-generator.org` 的 **Redirect** 列显示箭头和目标域名
- 或者显示 `→ bibleverse-generator.org`

---

## 🧪 测试重定向是否生效

### 测试1：浏览器测试（推荐）

1. **打开无痕/隐私窗口**（避免缓存影响）：
   - Chrome: `Ctrl+Shift+N` (Windows) 或 `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
   - Safari: `Cmd+Shift+N` (Mac)

2. **访问 www 版本**：
   在地址栏输入：
   ```
   https://www.bibleverse-generator.org
   ```
   按回车

3. **观察地址栏**：
   - ✅ 如果删除成功：浏览器会显示错误（DNS 查询失败）或自动跳转
   - ✅ 如果重定向生效：地址栏会自动变成 `https://bibleverse-generator.org`
   - ❌ 如果还显示 www：说明重定向还没生效，等待 5-10 分钟

4. **检查页面内容**：
   - 页面应该正常显示（不是 404 或错误页面）
   - 确认是你的网站主页

### 测试2：命令行测试（技术确认）

**macOS/Linux**：
```bash
curl -I https://www.bibleverse-generator.org
```

**Windows (PowerShell)**：
```powershell
curl.exe -I https://www.bibleverse-generator.org
```

**预期结果**（如果配置了重定向）：
```
HTTP/2 308
location: https://bibleverse-generator.org/
```

**预期结果**（如果删除了域名）：
```
curl: (6) Could not resolve host: www.bibleverse-generator.org
```
或者可能仍然返回 308（因为 Next.js 的代码重定向）

### 测试3：在线工具测试

1. 访问：https://httpstatus.io
2. 在输入框中输入：
   ```
   https://www.bibleverse-generator.org
   ```
3. 点击 **"Check"**
4. 查看结果：
   - ✅ 状态码：`308` 或 `301` (永久重定向)
   - ✅ Location: `https://bibleverse-generator.org`
   - 或者：DNS 错误（如果删除了域名）

### 测试4：验证非 www 版本正常

访问非 www 版本：
```
https://bibleverse-generator.org
```

确认：
- ✅ 页面正常显示
- ✅ 地址栏保持为 `https://bibleverse-generator.org`（不跳转）
- ✅ 网站功能正常

---

## ⚠️ 可能遇到的问题和解决方案

### 问题1：找不到 Domains 设置

**症状**：在 Settings 中找不到 Domains 选项

**原因**：
- 可能是账号权限不足（不是项目所有者）
- 或者 Vercel 界面更新了

**解决方案**：
1. 确认你是项目的 Owner（所有者）
2. 尝试在项目主页直接找 "View Domains" 按钮
3. 或访问直接链接（替换项目名）：
   ```
   https://vercel.com/你的用户名/random-bible-verse/settings/domains
   ```

### 问题2：删除后 www 仍然可以访问

**症状**：删除 www 域名后，访问 www 版本仍然能正常打开

**原因**：
- Next.js 的代码重定向仍在工作（这是好事！）
- DNS 缓存还没过期

**解决方案**：
✅ **不需要担心**，这是正常现象：
- Next.js 的重定向代码会处理所有 www 请求
- 只要地址栏最终跳转到非 www 版本就可以了

### 问题3：删除按钮是灰色的，无法点击

**症状**：Remove 按钮无法点击

**原因**：
- 这是项目的唯一自定义域名
- Vercel 不允许删除所有自定义域名

**解决方案**：
1. 不要删除 `bibleverse-generator.org`（非 www 版本）
2. 只删除 `www.bibleverse-generator.org`
3. 如果两个都无法删除，使用方案二（设置重定向）

### 问题4：删除后出现 SSL 证书错误

**症状**：访问网站显示 SSL 证书不安全

**原因**：
- 浏览器缓存了旧的 www 域名证书
- 或者配置还在传播中

**解决方案**：
1. 清除浏览器缓存
2. 使用无痕窗口重新测试
3. 等待 10-30 分钟让配置传播完成
4. 如果持续出现，检查 DNS 是否配置正确

### 问题5：Google Search Console 仍显示错误

**症状**：Vercel 配置完成后，Search Console 仍显示"重复网页"

**原因**：
- Google 还没重新抓取你的网站
- 需要时间让 Google 发现重定向

**解决方案**：
1. 等待 1-3 天让 Google 自动重新抓取
2. 或：在 Search Console 手动请求重新索引
   - 输入主页 URL: `https://bibleverse-generator.org`
   - 点击"请求编入索引"
3. 检查 www 版本是否显示为"重定向"
   - 输入: `https://www.bibleverse-generator.org`
   - 应该显示："URL 会重定向至其他网址"

### 问题6：DNS 提供商的记录该如何处理？

**症状**：不确定是否要在 Namecheap/GoDaddy 删除 www 记录

**解决方案**：

**如果你在 Vercel 删除了 www 域名**：
- ✅ 可以删除 DNS 中的 www CNAME 记录（可选）
- ✅ 或者保留（Next.js 重定向仍会工作）

**如果你在 Vercel 设置了重定向**：
- ✅ **保留** DNS 中的 www CNAME 记录
- ✅ 确保指向 `cname.vercel-dns.com`

**推荐做法**：
- 先不要动 DNS 记录
- 等待 1-2 天，确认重定向正常工作
- 再决定是否删除 www 的 DNS 记录

---

## 📊 完整操作流程总结

### 推荐流程（删除 www 域名）

```
1. 登录 Vercel Dashboard
   ↓
2. 进入 random-bible-verse 项目
   ↓
3. Settings → Domains
   ↓
4. 找到 www.bibleverse-generator.org
   ↓
5. 点击 ⋯ → Remove
   ↓
6. 确认删除
   ↓
7. 等待 5-10 分钟
   ↓
8. 浏览器测试重定向
   ↓
9. Google Search Console 请求重新索引
   ↓
10. 完成！等待 1-2 周看到效果
```

### 时间安排建议

| 时间点 | 操作 |
|--------|------|
| **现在** | 删除 Vercel 中的 www 域名 |
| **10分钟后** | 测试 www 重定向是否生效 |
| **30分钟后** | 在 Google Search Console 请求主页重新索引 |
| **1天后** | 检查 www 版本在 Search Console 是否显示"重定向" |
| **1周后** | 检查"重复网页"错误是否减少 |
| **2-4周后** | 验证所有问题已解决 |

---

## ✅ 操作检查清单

打印此清单，完成后打✓：

### Vercel 配置
- [ ] 登录 Vercel Dashboard
- [ ] 进入 random-bible-verse 项目
- [ ] 进入 Settings → Domains
- [ ] 找到 www.bibleverse-generator.org 域名
- [ ] 删除 www 域名（或设置重定向）
- [ ] 确认域名列表中只剩 bibleverse-generator.org

### 测试验证
- [ ] 浏览器无痕窗口访问 www 版本
- [ ] 确认地址栏跳转到非 www 版本
- [ ] 访问非 www 版本确认正常显示
- [ ] （可选）使用 curl 命令测试
- [ ] （可选）使用 httpstatus.io 在线工具测试

### Google Search Console
- [ ] 等待 Vercel 部署完成（10分钟）
- [ ] 请求主页重新索引
- [ ] 检查 www 版本状态（应显示"重定向"）
- [ ] 设置日历提醒，1周后检查进度

### 后续监控（1-4周）
- [ ] 每周检查 Search Console "网页"报告
- [ ] 确认"重复网页"错误逐渐消失
- [ ] 验证 Google 搜索结果只显示非 www 版本
- [ ] 观察 favicon 在搜索结果中的更新

---

## 📞 需要帮助？

### 如果遇到问题：

1. **Vercel 配置问题**：
   - 查看 Vercel 文档：https://vercel.com/docs/concepts/projects/domains
   - 联系 Vercel 支持（如果是付费用户）

2. **DNS 配置问题**：
   - 检查域名服务商的 DNS 设置
   - 使用 DNS 检查工具：https://dnschecker.org

3. **Google Search Console 问题**：
   - 查看帮助文档：https://support.google.com/webmasters
   - 在社区提问：https://support.google.com/webmasters/community

---

## 🎯 预期最终状态

### Vercel Domains 页面
```
Domain                              Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
bibleverse-generator.org            ✓ Valid
random-bible-verse-xxx.vercel.app   ✓ Valid
```

### Google Search Console
```
URL: https://www.bibleverse-generator.org
状态: URL 会重定向至其他网址
目标: https://bibleverse-generator.org
```

### Google 搜索结果
```
site:bibleverse-generator.org

结果：
📖 bibleverse-generator.org
   Random Bible Verse Generator | Daily Scripture
   https://bibleverse-generator.org/
   ✅ 只显示非 www 版本
   ✅ 显示正确的 favicon（几周后）
```

---

**完成这些步骤后，你的域名规范化问题将完全解决！** 🎉
