@echo off
chcp 65001 >nul
title Restaurant POS - Start API Server

echo ========================================
echo Restaurant POS - API Server
echo ========================================
echo.

cd /d "%~dp0RestaurantPOS.API"

if not exist "RestaurantPOS.API.csproj" (
    echo ERROR: Cannot find RestaurantPOS.API.csproj
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Starting API Server on LAN...
echo.
echo Server will be available at:
echo   - http://localhost:5000
echo   - http://YOUR_IP:5000
echo.
echo Press Ctrl+C to stop the server
echo.

dotnet run --launch-profile LAN

pause
