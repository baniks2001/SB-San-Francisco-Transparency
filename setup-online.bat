@echo off
title Online Access Setup Assistant
color 0B

echo ========================================
echo   🌐 Online Access Setup Assistant
echo   Sangguniang Bayan Transparency Portal
echo ========================================
echo.

echo This assistant will help you set up
echo online access for your portal.
echo.

REM Step 1: Check prerequisites
echo [1/6] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js installed

REM Check build directory
if not exist "build" (
    echo ❌ Build directory not found. Building now...
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Build failed. Please fix errors first.
        pause
        exit /b 1
    )
) else (
    echo ✅ Build directory exists
)

REM Check if proxy-server.js exists
if not exist "proxy-server.js" (
    echo ❌ proxy-server.js not found.
    pause
    exit /b 1
)
echo ✅ Proxy server file exists

echo.
echo [2/6] Finding your IP addresses...

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP: =!
    goto :found_local
)
:found_local
echo ✅ Local IP: !LOCAL_IP!

REM Get public IP
echo 🌐 Getting your public IP...
powershell -Command "(Invoke-WebRequest -Uri 'https://ipinfo.io/ip' -UseBasicParsing).Content.Trim()" > public_ip.txt
set /p PUBLIC_IP=<public_ip.txt
del public_ip.txt
echo ✅ Public IP: !PUBLIC_IP!

echo.
echo [3/6] Checking server status...

REM Check backend
netstat -an | findstr :5000 >nul
if %errorlevel% neq 0 (
    echo ❌ Backend server not running on port 5000.
    echo    Please start it first:
    echo    cd server
    echo    npm run dev
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "!continue!"=="y" (
        exit /b 1
    )
) else (
    echo ✅ Backend server is running
)

echo.
echo [4/6] Starting proxy server...

REM Check if port 80 is available
netstat -an | findstr ":80 " >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 80 is in use. Using port 8080 instead.
    set PROXY_PORT=8080
) else (
    echo ✅ Port 80 is available
    set PROXY_PORT=80
)

echo 🚀 Starting proxy server on port !PROXY_PORT!...
echo.
echo 📋 IMPORTANT URLs:
echo    Local:     http://localhost!PROXY_PORT:80!
echo    Network:   http://!LOCAL_IP!!PROXY_PORT:80!
echo    Public:    http://!PUBLIC_IP!!PROXY_PORT:80!
echo.

REM Start proxy server in background
start "Proxy Server" cmd /k "cd /d %CD% && node proxy-server.js"

echo ✅ Proxy server started in new window
echo.

echo [5/6] Testing local access...
timeout /t 3 >nul
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost!PROXY_PORT:80!' -TimeoutSec 5; Write-Host '✅ Local access working' } catch { Write-Host '❌ Local access failed' }"

echo.
echo [6/6] Setup Instructions:
echo.
echo 🌐 ONLINE ACCESS SETUP:
echo =====================
echo.
echo 1. ROUTER CONFIGURATION:
echo    - Open browser: http://192.168.1.1
echo    - Login with admin/password
echo    - Find "Port Forwarding" section
echo    - Add new rule:
echo      * External Port: !PROXY_PORT!
echo      * Internal Port: !PROXY_PORT!
echo      * Protocol: TCP
echo      * Internal IP: !LOCAL_IP!
echo    - Save and restart router
echo.
echo 2. TEST ONLINE ACCESS:
echo    - Use mobile data (NOT WiFi)
echo    - Open: http://!PUBLIC_IP!!PROXY_PORT:80!
echo    - Should load your portal
echo.
echo 3. SHARE YOUR PORTAL:
echo    - Share this URL: http://!PUBLIC_IP!!PROXY_PORT:80!
echo    - Works on phones, tablets, computers
echo    - Accessible from anywhere in world
echo.
echo 📱 MOBILE TESTING:
echo - Turn off WiFi on your phone
echo - Open browser and go to: http://!PUBLIC_IP!!PROXY_PORT:80!
echo - Should work perfectly on mobile
echo.
echo 🔒 SECURITY TIPS:
echo - Change router admin password
echo - Consider HTTPS setup (Cloudflare)
echo - Monitor server logs regularly
echo.
echo 📋 QUICK REFERENCE:
echo - Local IP:    !LOCAL_IP!
echo - Public IP:   !PUBLIC_IP!
echo - Proxy Port:  !PROXY_PORT!
echo - Access URL:  http://!PUBLIC_IP!!PROXY_PORT:80!
echo.
echo 🎯 NEXT STEPS:
echo 1. Configure router port forwarding
echo 2. Test from mobile data
echo 3. Share with users
echo.
echo 📖 For detailed guide: online-access-guide.md
echo.
echo 🛑 To stop: Close the proxy server window
echo.
pause
