@echo off
title Sangguniang Bayan Online Setup
color 0A

echo ========================================
echo   Sangguniang Bayan Online Setup
echo ========================================
echo.

REM Check if node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js installed
node --version

REM Check if build directory exists
if not exist "build" (
    echo.
    echo ❌ Build directory not found.
    echo    Building application now...
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Build failed. Please fix build errors first.
        pause
        exit /b 1
    )
    echo ✅ Application built successfully
) else (
    echo ✅ Build directory exists
)

REM Check if backend is running
echo.
echo 🔍 Checking backend server...
netstat -an | findstr :5000 >nul
if %errorlevel% neq 0 (
    echo ❌ Backend server not running on port 5000.
    echo    Please start the backend first:
    echo    cd server
    echo    npm run dev
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
) else (
    echo ✅ Backend server is running on port 5000
)

REM Check for port conflicts
echo.
echo 🔍 Checking port availability...
netstat -an | findstr ":80 " >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 80 is already in use.
    echo    Would you like to:
    echo    1. Use port 8080 instead (recommended)
    echo    2. Try port 80 anyway (may cause conflicts)
    echo    3. Cancel
    echo.
    set /p choice="Choose option (1/2/3): "
    
    if "%choice%"=="1" (
        echo 🚀 Starting on port 8080...
        call npm run proxy:8080
    ) else if "%choice%"=="2" (
        echo 🚀 Starting on port 80...
        echo ⚠️  If you get permission errors, run as administrator
        call npm run proxy
    ) else (
        echo Cancelled.
        exit /b 1
    )
) else (
    echo ✅ Port 80 is available
    echo 🚀 Starting on port 80...
    echo ⚠️  If you get permission errors, run as administrator or use port 8080
    call npm run proxy
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo 🌐 Your application is now running!
echo.
echo Access URLs:
echo   Local:    http://localhost
echo   Network:  http://your-local-ip
echo   Public:   http://your-public-ip (after port forwarding)
echo.
echo 📱 Mobile Access:
echo   1. Connect to same WiFi network
echo   2. Use your computer's IP address
echo   3. Test on mobile device
echo.
echo 🌐 Online Access:
echo   1. Forward port 80 on your router
echo   2. Get your public IP from: https://whatismyip.com
echo   3. Access from anywhere: http://your-public-ip
echo.
echo 🛑 To stop: Press Ctrl+C
echo.
echo 📋 For help: See online-setup.md
echo.
pause
