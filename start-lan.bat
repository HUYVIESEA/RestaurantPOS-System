@echo off
chcp 65001 >nul
title Restaurant POS - LAN Startup

echo ========================================
echo Restaurant POS - LAN Startup
echo ========================================
echo.

:: Get IP address
echo Detecting IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" ^| findstr /v "127.0.0.1"') do (
    set IP=%%a
    goto :found_ip
)

:found_ip
:: Remove leading spaces
for /f "tokens=* delims= " %%a in ("%IP%") do set IP=%%a

if defined IP (
    echo.
    echo Your IP Address: %IP%
    echo.
    echo Access URLs:
    echo   Client:  http://%IP%:5173
    echo   API:     http://%IP%:5000
    echo   Swagger: http://%IP%:5000/swagger
    echo.
) else (
    echo Warning: Could not detect IP address
    echo.
)

:: Check firewall rules
echo Checking firewall rules...
netsh advfirewall firewall show rule name="Restaurant POS API" >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo WARNING: Firewall rules not found!
    echo Run 'setup-firewall.bat' as Administrator first
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b
) else (
    echo [OK] Firewall rules configured
)

echo.
echo Starting services...
echo.

:: Start API Server
echo 1. Starting API Server...
start "Restaurant POS - API Server" cmd /k "%~dp0start-api.bat"
timeout /t 2 /nobreak >nul
echo [OK] API Server started in new window

:: Start Client
echo 2. Starting React Client...
start "Restaurant POS - Client" cmd /k "%~dp0start-client.bat"
timeout /t 1 /nobreak >nul
echo [OK] Client started in new window

echo.
echo ========================================
echo Services are starting...
echo ========================================
echo.
echo Wait a few seconds for services to start, then access:
if defined IP (
    echo   http://%IP%:5173
)
echo.
echo Press any key to exit this window...
pause >nul
