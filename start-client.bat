@echo off
chcp 65001 >nul
title Restaurant POS - Start Client

echo ========================================
echo Restaurant POS - React Client
echo ========================================
echo.

cd /d "%~dp0restaurant-pos-client"

if not exist "package.json" (
    echo ERROR: Cannot find package.json
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Starting React Client...
echo.
echo Client will be available at:
echo   - http://localhost:5173
echo   - http://YOUR_IP:5173
echo.
echo Press Ctrl+C to stop the client
echo.

npm run dev

pause
