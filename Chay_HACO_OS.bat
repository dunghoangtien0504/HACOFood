@echo off
title HACO Food OS - Dev Server
cd /d "d:\Kinh doanh\AI\Quan-tri\haco-food-os"
echo ==========================================
echo    DANG KHOI DONG HACO FOOD OS...
echo    Vui long cho trong giay lat...
echo ==========================================
echo.

:: Chay dev server o tien trinh nen
start /b npm run dev

:: Cho 4 giay de server Next.js khoi dong xong
timeout /t 4 >nul

:: Tu dong mo trinh duyet mac dinh
start http://localhost:3000

echo ==========================================
echo HACO Food OS dang chay tai http://localhost:3000
echo Ban co the dong cua so nay de tat server.
echo ==========================================
pause

