@echo off
echo ================================================================
echo 修复 Trending Generators 显示问题
echo ================================================================
echo.

echo 步骤 1: 清理缓存...
echo 请先在运行 npm run dev 的终端按 Ctrl+C 停止服务器
echo.

REM 清理 .next 缓存
if exist .next (
    echo 删除 .next 缓存目录...
    rmdir /s /q .next
    echo ✓ .next 目录已删除
) else (
    echo ℹ .next 目录不存在，跳过
)

REM 清理 node_modules/.cache
if exist node_modules\.cache (
    echo 删除 node_modules/.cache...
    rmdir /s /q node_modules\.cache
    echo ✓ 缓存已清理
)

echo.
echo ✓ 缓存清理完成！
echo.
echo 下一步操作：
echo 1. 运行: npm run dev -- -p 3001
echo 2. 访问: http://localhost:3001
echo 3. 在页面上向下滚动，查找 'Trending Generators'
echo 4. 如果还是看不到，按 Ctrl+Shift+R 强制刷新浏览器
echo.
pause
