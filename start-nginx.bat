@echo off
echo Starting Sangguniang Bayan Portal with Nginx...
echo.

REM Check if build directory exists
if not exist "build" (
    echo Error: Build directory not found. Please run 'npm run build' first.
    pause
    exit /b 1
)

REM Check if nginx.conf exists
if not exist "nginx.conf" (
    echo Error: nginx.conf not found. Please ensure the configuration file exists.
    pause
    exit /b 1
)

REM Try to find nginx installation
set NGINX_PATH=""
if exist "C:\nginx\nginx.exe" (
    set NGINX_PATH=C:\nginx
) else if exist "C:\Program Files\nginx\nginx.exe" (
    set NGINX_PATH=C:\Program Files\nginx
) else if exist "D:\nginx\nginx.exe" (
    set NGINX_PATH=D:\nginx
) else (
    echo Error: Nginx not found in common locations.
    echo Please install Nginx or update the paths in this script.
    echo Common locations:
    echo   - C:\nginx
    echo   - C:\Program Files\nginx
    echo   - D:\nginx
    pause
    exit /b 1
)

echo Found Nginx at: %NGINX_PATH%
echo.

REM Check if backend is running
echo Checking if backend is running on port 5000...
netstat -an | findstr :5000 >nul
if %errorlevel% neq 0 (
    echo Warning: Backend not detected on port 5000.
    echo Please ensure the backend server is running:
    echo   cd server
    echo   npm run dev
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
)

echo Starting Nginx...
echo Configuration: %CD%\nginx.conf
echo.

REM Start nginx
cd /d "%NGINX_PATH%"
nginx.exe -c "%CD%\..\sangguniang-bayan-app\nginx.conf"

if %errorlevel% neq 0 (
    echo Error: Failed to start Nginx.
    echo Check the configuration file: %CD%\..\sangguniang-bayan-app\nginx.conf
    pause
    exit /b 1
)

echo.
echo ✅ Nginx started successfully!
echo.
echo 🌐 Access your application at: http://localhost
echo 📱 For mobile access, use: http://your-local-ip
echo.
echo To stop Nginx, run: stop-nginx.bat
echo To check logs, see: %NGINX_PATH%\logs\
echo.
pause
