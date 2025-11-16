@echo off
REM ============================================
REM Restaurant POS System - Quick Start
REM Version: 2.0.0
REM ============================================

echo.
echo ========================================
echo  Restaurant POS - Quick Start v2.0
echo ========================================
echo.

REM Check if setup has been run
if not exist "restaurant-pos-client\node_modules" (
    echo [ERROR] Setup not complete!
    echo Please run setup.bat first
    echo.
    pause
    exit /b 1
)

echo Starting servers...
echo.

REM Start backend
echo [1/2] Starting backend...
start "Restaurant POS - Backend API" cmd /k "cd RestaurantPOS.API && echo Backend API Server && echo ==================== && dotnet run"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend
echo [2/2] Starting frontend...
start "Restaurant POS - Frontend" cmd /k "cd restaurant-pos-client && echo Frontend Development Server && echo ========================== && npm run dev"

echo.
echo ========================================
echo  Servers Starting...
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Swagger UI:   http://localhost:5000/swagger
echo Frontend:     http://localhost:5173
echo.
echo ========================================
echo.
echo Login Credentials:
echo Email:    admin@bundaumet.com
echo Password: Admin@123
echo.
echo ========================================
echo.
echo Check the new terminal windows for logs
echo Press Ctrl+C in each window to stop servers
echo.
pause
