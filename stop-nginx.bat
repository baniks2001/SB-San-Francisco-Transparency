@echo off
echo Stopping Nginx...

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
    pause
    exit /b 1
)

cd /d "%NGINX_PATH%"

REM Stop nginx
nginx.exe -s quit

echo.
echo ✅ Nginx stopped successfully!
echo.
pause
