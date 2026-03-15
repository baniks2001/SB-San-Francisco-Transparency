@echo off
echo Searching for Nginx installation...
echo.

REM Check common locations
set FOUND=0

if exist "C:\nginx\nginx.exe" (
    echo Found Nginx at: C:\nginx
    set NGINX_PATH=C:\nginx
    set FOUND=1
) else if exist "C:\Program Files\nginx\nginx.exe" (
    echo Found Nginx at: C:\Program Files\nginx
    set NGINX_PATH=C:\Program Files\nginx
    set FOUND=1
) else if exist "D:\nginx\nginx.exe" (
    echo Found Nginx at: D:\nginx
    set NGINX_PATH=D:\nginx
    set FOUND=1
) else if exist "C:\Program Files (x86)\nginx\nginx.exe" (
    echo Found Nginx at: C:\Program Files (x86)\nginx
    set NGINX_PATH=C:\Program Files (x86)\nginx
    set FOUND=1
) else (
    echo Searching entire C: drive for nginx.exe...
    for /f "delims=" %%i in ('dir /s /b C:\nginx.exe 2^>nul') do (
        echo Found Nginx at: %%~dpi
        set NGINX_PATH=%%~dpi
        set FOUND=1
        goto :found
    )
)

:found
if %FOUND%==1 (
    echo.
    echo ✅ Nginx found at: %NGINX_PATH%
    echo.
    echo To start Nginx manually:
    echo   cd /d "%NGINX_PATH%"
    echo   nginx.exe -c "%CD%\nginx.conf"
    echo.
    echo To stop Nginx manually:
    echo   cd /d "%NGINX_PATH%"
    echo   nginx.exe -s quit
    echo.
    echo Would you like to start Nginx now? (y/n)
    set /p start=
    if /i "%start%"=="y" (
        echo Starting Nginx...
        cd /d "%NGINX_PATH%"
        nginx.exe -c "%CD%\..\sangguniang-bayan-app\nginx.conf"
        if %errorlevel% neq 0 (
            echo ❌ Failed to start Nginx
            echo Check the configuration file: %CD%\..\sangguniang-bayan-app\nginx.conf
        ) else (
            echo ✅ Nginx started successfully!
            echo.
            echo 🌐 Access your application at: http://localhost
            echo.
        )
    )
) else (
    echo ❌ Nginx not found. Please ensure Nginx is installed.
    echo.
    echo Download from: https://nginx.org/en/download.html
    echo Extract to: C:\nginx\
)

pause
