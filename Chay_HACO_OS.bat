@echo off
title HACO Food OS - Dev Server
cd /d "d:\Kinh doanh\AI\Quan-tri\haco-food-os"
echo ==========================================
echo    DANG KHOI DONG HACO FOOD OS...
echo ==========================================
echo.

:: Tu dong giai phong cong 3003 neu dang bi chiem dung
echo [1/3] Kiem tra va giai phong cong 3003...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":3003 *LISTENING"') do (
    echo Phat hien tien trinh %%a dang chay tren cong 3003. Dang tat...
    taskkill /f /pid %%a >nul 2>&1
)

:: Chay dev server o tien trinh nen tren cong 3003
echo [2/3] Dang khoi dong Next.js Dev Server tren cong 3003...
start /b npm run dev

:: Cho 4 giay de server Next.js khoi dong xong
timeout /t 4 >nul

:: Tu dong mo trinh duyet mac dinh
echo [3/3] Dang mo trinh duyet...
start http://localhost:3003

echo ==========================================
echo HACO Food OS dang chay tai http://localhost:3003
echo Ban co the dong cua so nay de tat server.
echo ==========================================
pause


