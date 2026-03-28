@echo off
setlocal EnableDelayedExpansion
echo ===================================================
echo Restaurant POS - Project Setup Script (Auto-Install)
echo ===================================================
echo.

REM Check for Winget
where winget >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'winget' is not found on this system.
    echo Please update "App Installer" from the Microsoft Store.
    goto check_manual
)

echo 1. Checking Prerequisites...

REM --- .NET SDK ---
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] .NET SDK is not installed.
    echo Attempting to auto-install .NET SDK 9.0...
    winget install Microsoft.DotNet.SDK.9 --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
        echo [ERROR] Automatic installation failed.
        pause
        exit /b
    )
    echo [INFO] .NET SDK installed. 
    echo [IMPORTANT] Restart this script!
    pause
    exit /b
) else (
    echo [OK] .NET SDK found.
)

REM --- Node.js ---
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Node.js is not installed.
    echo Attempting to auto-install Node.js LTS...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
        echo [ERROR] Automatic installation failed.
        pause
        exit /b
    )
    echo [INFO] Node.js installed.
    echo [IMPORTANT] Restart this script!
    pause
    exit /b
) else (
    echo [OK] Node.js found.
)

:check_manual
echo.
echo 2. Setting up Backend (API)...
cd RestaurantPOS.API

dotnet tool list -g | findstr "dotnet-ef" >nul
if errorlevel 1 (
    echo   - Installing dotnet-ef tool...
    dotnet tool install --global dotnet-ef
)

echo   - Restoring NuGet packages...
dotnet restore
if errorlevel 1 (
    echo [ERROR] Failed to restore .NET packages.
    pause
    exit /b
)
cd ..
echo [OK] Backend setup complete.
echo.

echo 3. Setting up Frontend (Client)...
cd restaurant-pos-client
echo   - Installing NPM packages...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install NPM packages.
    pause
    exit /b
)
cd ..
echo [OK] Frontend setup complete.
echo.

echo 4. Database Setup

echo 4. Database Setup

where psql >nul 2>&1
if not errorlevel 1 goto db_check_connection

echo [WARNING] PostgreSQL tools (psql) not found.
set /p install_pg="Do you want to auto-install PostgreSQL now? (Y/N) > "
if /i not "!install_pg!"=="Y" goto db_check_connection

winget install PostgreSQL.PostgreSQL --accept-source-agreements --accept-package-agreements
if errorlevel 1 (
    echo   [ERROR] PostgreSQL installation failed.
) else (
    echo   [INFO] PostgreSQL installed successfully.
    echo   [IMPORTANT] Service configuration requires restart/manual setup.
)

:db_check_connection
echo   Checking database connection...
cd RestaurantPOS.API
dotnet ef dbcontext info >nul 2>&1
if errorlevel 1 (
    echo   [WARNING] Cannot connect to Database.
    echo   Please check 'appsettings.json' and ensure PostgreSQL service is running.
) else (
    echo   [OK] Connected to Database successfully.
)

echo.
echo   Do you want to apply Entity Framework Migrations? (Y/N)
set /p update_db="> "
if /i "%update_db%"=="Y" (
    echo   Applying migrations...
    dotnet ef database update
    if errorlevel 1 (
         echo [WARNING] Failed to update database.
    )
)

echo.
echo   Do you want to seed initial data? (Y/N)
set /p seed_db="> "
if /i "%seed_db%"=="Y" (
    echo   Seeding database...
    dotnet run --seed
)
cd ..

echo.
echo ===================================================
echo Setup Complete!
echo You can now run 'manage-processes.bat'
echo ===================================================
pause
