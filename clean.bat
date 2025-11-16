@echo off
REM ============================================
REM Restaurant POS System - Clean Script
REM Version: 2.0.0
REM ============================================

echo.
echo ========================================
echo  Restaurant POS - Clean Script v2.0
echo ========================================
echo.

echo This script will clean:
echo - node_modules
echo - .vite cache
echo - bin and obj folders
echo - build outputs
echo.

choice /C YN /M "Continue with cleanup?"
if %errorLevel% == 2 (
    echo Cleanup cancelled
    exit /b 0
)

echo.
echo Starting cleanup...
echo.

REM Clean Frontend
echo [1/4] Cleaning frontend...
cd restaurant-pos-client

if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
    echo [OK] node_modules removed
)

if exist .vite (
    echo Removing .vite cache...
    rmdir /s /q .vite
    echo [OK] .vite cache removed
)

if exist dist (
    echo Removing dist...
    rmdir /s /q dist
    echo [OK] dist removed
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
    echo [OK] package-lock.json removed
)

cd ..

REM Clean Backend
echo.
echo [2/4] Cleaning backend...
cd RestaurantPOS.API

if exist bin (
    echo Removing bin...
    rmdir /s /q bin
    echo [OK] bin removed
)

if exist obj (
    echo Removing obj...
    rmdir /s /q obj
    echo [OK] obj removed
)

if exist Migrations (
    echo.
    choice /C YN /M "Remove migrations folder?"
    if %errorLevel% == 1 (
        rmdir /s /q Migrations
        echo [OK] Migrations removed
    )
)

cd ..

REM Clean Temp Files
echo.
echo [3/4] Cleaning temp files...

if exist *.log (
    echo Removing log files...
    del /q *.log
    echo [OK] Log files removed
)

REM Clean User Specific Files
echo.
echo [4/4] Cleaning user-specific files...

if exist .vs (
    echo Removing .vs folder...
    rmdir /s /q .vs
    echo [OK] .vs folder removed
)

if exist *.user (
    echo Removing .user files...
    del /q *.user
    echo [OK] .user files removed
)

echo.
echo ========================================
echo  Cleanup Complete!
echo ========================================
echo.
echo The following have been cleaned:
echo - Frontend dependencies and cache
echo - Backend build outputs
echo - Temporary files
echo - User-specific files
echo.
echo To reinstall everything, run: setup.bat
echo.
pause
