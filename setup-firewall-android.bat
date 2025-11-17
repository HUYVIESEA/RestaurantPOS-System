@echo off
REM ============================================
REM Setup Firewall for Android Development
REM Run this as Administrator
REM ============================================

echo ========================================
echo Setup Firewall for Restaurant POS API
echo ========================================
echo.

REM Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Adding firewall rule for port 5000...
echo.

REM Remove existing rule if exists
netsh advfirewall firewall delete rule name="Restaurant POS API - Android" >nul 2>&1

REM Add new rule
netsh advfirewall firewall add rule name="Restaurant POS API - Android" dir=in action=allow protocol=TCP localport=5000 profile=any

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Firewall rule added.
    echo ========================================
    echo.
    echo Android devices can now connect to:
    echo http://172.16.10.188:5000
    echo.
    echo Make sure:
    echo 1. Backend is running
    echo 2. Device is on same WiFi
    echo 3. build.gradle.kts has correct IP
    echo.
) else (
    echo.
    echo [ERROR] Failed to add firewall rule
    echo.
)

pause
