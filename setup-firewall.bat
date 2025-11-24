@echo off
chcp 65001 >nul
title Restaurant POS - Firewall Setup

echo ========================================
echo Restaurant POS - Firewall Setup
echo ========================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Creating firewall rules...
echo.

:: Remove old rules if they exist
echo Removing old rules (if any)...
netsh advfirewall firewall delete rule name="Restaurant POS API" >nul 2>&1
netsh advfirewall firewall delete rule name="Restaurant POS API HTTPS" >nul 2>&1
netsh advfirewall firewall delete rule name="Restaurant POS Client" >nul 2>&1

:: Create new rules
echo Creating new firewall rules...
echo.

:: API HTTP (Port 5000)
netsh advfirewall firewall add rule name="Restaurant POS API" dir=in action=allow protocol=TCP localport=5000 profile=any description="Allow inbound connections to Restaurant POS API (HTTP)"
if %errorLevel% equ 0 (
    echo [OK] Created rule for API HTTP (Port 5000)
) else (
    echo [FAIL] Failed to create API HTTP rule
)

:: API HTTPS (Port 7000)
netsh advfirewall firewall add rule name="Restaurant POS API HTTPS" dir=in action=allow protocol=TCP localport=7000 profile=any description="Allow inbound connections to Restaurant POS API (HTTPS)"
if %errorLevel% equ 0 (
    echo [OK] Created rule for API HTTPS (Port 7000)
) else (
    echo [FAIL] Failed to create API HTTPS rule
)

:: Client (Port 5173)
netsh advfirewall firewall add rule name="Restaurant POS Client" dir=in action=allow protocol=TCP localport=5173 profile=any description="Allow inbound connections to Restaurant POS Client (Vite)"
if %errorLevel% equ 0 (
    echo [OK] Created rule for Client (Port 5173)
) else (
    echo [FAIL] Failed to create Client rule
)

echo.
echo ========================================
echo Firewall configuration completed!
echo ========================================
echo.

:: Display IP address
echo Your IP addresses:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    echo   - %%a
)

echo.
echo You can now access the application from other devices using:
echo   Client: http://YOUR_IP:5173
echo   API:    http://YOUR_IP:5000
echo.
pause
