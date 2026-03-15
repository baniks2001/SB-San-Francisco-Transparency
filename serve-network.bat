@echo off
title Sangguniang Bayan - Network Serve

echo ========================================
echo   Sangguniang Bayan Transparency Portal
echo   Network Build Serve
echo ========================================
echo.

echo [1/2] Building the application...
call npm run build

echo.
echo [2/2] Starting network serve...
echo.
node scripts/serve-network.js

echo.
echo ========================================
echo   Network serving stopped
echo ========================================
echo.

pause
