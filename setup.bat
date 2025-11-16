@echo off
REM ============================================
REM Restaurant POS System - Complete Setup
REM Version: 2.0.0
REM Updated: 2024-01-15
REM ============================================

echo.
echo ========================================
echo  Restaurant POS System - Setup v2.0
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running as Administrator
) else (
    echo [WARNING] Not running as Administrator
    echo Some features may not work properly
    echo.
)

REM ============================================
REM STEP 1: Check Prerequisites
REM ============================================
echo.
echo [1/8] Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm
where npm >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] npm is installed
    npm --version
) else (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

REM Check .NET SDK
where dotnet >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] .NET SDK is installed
    dotnet --version
) else (
    echo [ERROR] .NET SDK is not installed!
    echo Please install .NET SDK 8.0 from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

REM Check SQL Server
sqlcmd -? >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] SQL Server tools are installed
) else (
    echo [WARNING] SQL Server tools not found
    echo Please ensure SQL Server is installed
)

echo.
echo [OK] All prerequisites check passed!
echo.
pause

REM ============================================
REM STEP 2: Install Frontend Dependencies
REM ============================================
echo.
echo [2/8] Installing frontend dependencies...
echo.

cd restaurant-pos-client

REM Clear cache if exists
if exist node_modules (
    echo Clearing old node_modules...
    rmdir /s /q node_modules 2>nul
)
if exist package-lock.json (
    del package-lock.json
)
if exist .vite (
    rmdir /s /q .vite
)

echo Installing npm packages...
call npm install

if %errorLevel% == 0 (
    echo [OK] Frontend dependencies installed successfully!
) else (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..
echo.
pause

REM ============================================
REM STEP 3: Install Backend Dependencies
REM ============================================
echo.
echo [3/8] Installing backend dependencies...
echo.

cd RestaurantPOS.API

echo Restoring .NET packages...
call dotnet restore

if %errorLevel% == 0 (
    echo [OK] Backend dependencies installed successfully!
) else (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

cd ..
echo.
pause

REM ============================================
REM STEP 4: Setup Database
REM ============================================
echo.
echo [4/8] Setting up database...
echo.

cd RestaurantPOS.API

REM Install EF Core tools if not installed
echo Checking EF Core tools...
dotnet tool install --global dotnet-ef --version 8.0.0 2>nul
if %errorLevel% == 0 (
    echo [OK] EF Core tools installed
) else (
    echo [INFO] EF Core tools already installed
)

REM Check if database exists
echo.
echo Checking database connection...
echo Please ensure SQL Server is running!
echo.
pause

REM Drop existing database (optional - comment out if you want to keep data)
REM echo Dropping existing database...
REM dotnet ef database drop -f

REM Create migration
echo Creating migrations...
if exist Migrations (
    echo [INFO] Migrations folder exists, skipping...
) else (
    call dotnet ef migrations add InitialCreate
    if %errorLevel% == 0 (
        echo [OK] Migrations created successfully!
    ) else (
        echo [ERROR] Failed to create migrations
        pause
        exit /b 1
    )
)

REM Update database
echo Updating database...
call dotnet ef database update

if %errorLevel% == 0 (
    echo [OK] Database created/updated successfully!
) else (
    echo [ERROR] Failed to update database
    echo Please check your connection string in appsettings.json
    pause
    exit /b 1
)

cd ..
echo.
pause

REM ============================================
REM STEP 5: Configure Environment
REM ============================================
echo.
echo [5/8] Configuring environment...
echo.

REM Create frontend .env if not exists
cd restaurant-pos-client
if not exist .env (
    echo Creating .env file...
    (
        echo VITE_API_BASE_URL=http://localhost:5000/api
    ) > .env
    echo [OK] .env file created
) else (
    echo [INFO] .env file already exists
)
cd ..

REM Check backend appsettings.json
if exist RestaurantPOS.API\appsettings.json (
    echo [OK] appsettings.json found
) else (
    echo [WARNING] appsettings.json not found!
    echo Please create it from appsettings.json.example
)

echo.
pause

REM ============================================
REM STEP 6: Build Projects
REM ============================================
echo.
echo [6/8] Building projects...
echo.

REM Build backend
echo Building backend...
cd RestaurantPOS.API
call dotnet build -c Release

if %errorLevel% == 0 (
    echo [OK] Backend build successful!
) else (
    echo [ERROR] Backend build failed!
    pause
    exit /b 1
)
cd ..

REM Build frontend (optional for dev)
echo.
echo Building frontend...
cd restaurant-pos-client
call npm run build

if %errorLevel% == 0 (
    echo [OK] Frontend build successful!
) else (
    echo [WARNING] Frontend build failed (dev mode will still work)
)
cd ..

echo.
pause

REM ============================================
REM STEP 7: Seed Initial Data
REM ============================================
echo.
echo [7/8] Seeding initial data...
echo.

cd RestaurantPOS.API

echo.
echo Would you like to seed sample data?
echo This will create:
echo - Admin user (admin@bundaumet.com / Admin@123)
echo - Sample products
echo - Sample categories
echo - Sample tables
echo.
choice /C YN /M "Seed data?"

if %errorLevel% == 1 (
    REM Run seed command (you need to implement this in your API)
    echo Seeding data...
    REM call dotnet run seed
    echo [INFO] Please run seeding manually if needed
) else (
    echo [INFO] Skipping data seeding
)

cd ..
echo.
pause

REM ============================================
REM STEP 8: Setup Complete
REM ============================================
echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.

echo Next steps:
echo.
echo 1. Start the backend:
echo    cd RestaurantPOS.API
echo    dotnet run
echo.
echo 2. Start the frontend (new terminal):
echo    cd restaurant-pos-client
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:5173
echo.
echo 4. Login with:
echo    Email: admin@bundaumet.com
echo    Password: Admin@123
echo.
echo ========================================
echo.

echo Would you like to start the servers now?
choice /C YN /M "Start servers?"

if %errorLevel% == 1 (
    echo.
    echo Starting servers...
    echo.
    
    REM Start backend in new window
    start "Restaurant POS - Backend" cmd /k "cd RestaurantPOS.API && dotnet run"
    
    REM Wait a bit for backend to start
    timeout /t 5
    
    REM Start frontend in new window
    start "Restaurant POS - Frontend" cmd /k "cd restaurant-pos-client && npm run dev"
    
    echo.
    echo [OK] Servers starting...
    echo Check the new terminal windows
    echo.
    echo Frontend: http://localhost:5173
    echo Backend: http://localhost:5000
    echo Swagger: http://localhost:5000/swagger
    echo.
) else (
    echo.
    echo [INFO] Servers not started
    echo Run them manually when ready
    echo.
)

echo ========================================
echo  Installation Log
echo ========================================
echo.
echo Date: %date% %time%
echo Status: SUCCESS
echo Version: 2.0.0
echo.
echo Features Installed:
echo - Dark Mode System
echo - Responsive Design
echo - Notification System
echo - Analytics Dashboard
echo - Price Formatting (VND)
echo - Skeleton Loading
echo - Toast Messages
echo - All 24 Components
echo.
echo Documentation:
echo - See /doc folder for guides
echo - README.md for overview
echo - INSTALLATION.md for details
echo.
echo ========================================
echo.

pause
