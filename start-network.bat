@echo off
title Sangguniang Bayan - Network Monitor Startup

echo ========================================
echo   Sangguniang Bayan Transparency Portal
echo   Continuous Network Monitoring & Startup
echo ========================================
echo.

echo [1/3] Starting continuous network monitoring...
start "Network Monitor" cmd /k "node scripts/network-monitor.js monitor"

echo.
echo [2/3] Starting backend server...
cd server
start "Backend Server" cmd /k "npm run dev"

echo.
echo [3/3] Starting frontend server...
cd ..
start "Frontend Server" cmd /k "npm run start:dev"

echo.
echo ========================================
echo   Servers starting with network monitoring...
echo   Network Monitor will auto-update IP changes
echo   Check Network Monitor window for URLs
echo ========================================
echo.

echo Network Commands:
echo   npm run network:check   - Check current network status
echo   npm run network:update  - Manually update IP
echo.

pause
