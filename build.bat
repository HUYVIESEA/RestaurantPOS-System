@echo off
REM ============================================
REM Restaurant POS System - Production Build
REM Version: 2.0.0
REM ============================================

echo.
echo ========================================
echo  Restaurant POS - Production Build
echo ========================================
echo.

echo This will build the project for production deployment
echo.
pause

REM Create output directory
if not exist "dist" mkdir dist

echo.
echo [1/5] Building Frontend...
echo.

cd restaurant-pos-client

REM Clean previous build
if exist dist (
    echo Cleaning previous build...
    rmdir /s /q dist
)

REM Build
echo Building React app...
call npm run build

if %errorLevel% == 0 (
    echo [OK] Frontend build successful!
    
    REM Copy to main dist folder
    echo Copying build files...
    xcopy /E /I /Y dist ..\dist\frontend
    echo [OK] Files copied to dist/frontend
) else (
    echo [ERROR] Frontend build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [2/5] Building Backend...
echo.

cd RestaurantPOS.API

REM Clean previous build
if exist publish (
    echo Cleaning previous publish...
    rmdir /s /q publish
)

REM Publish
echo Publishing .NET app...
call dotnet publish -c Release -o publish

if %errorLevel% == 0 (
    echo [OK] Backend build successful!
    
    REM Copy to main dist folder
    echo Copying publish files...
    xcopy /E /I /Y publish ..\dist\backend
    echo [OK] Files copied to dist/backend
) else (
    echo [ERROR] Backend build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [3/5] Building Desktop...
echo.

cd RestaurantPOS.Desktop

REM Clean previous build
if exist publish (
    echo Cleaning previous publish...
    rmdir /s /q publish
)

REM Publish
echo Publishing Desktop app...
call dotnet publish -c Release -o publish

if %errorLevel% == 0 (
    echo [OK] Desktop build successful!
    
    REM Copy to main dist folder
    echo Copying publish files...
    xcopy /E /I /Y publish ..\dist\desktop
    echo [OK] Files copied to dist/desktop
) else (
    echo [ERROR] Desktop build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [4/5] Building Manager...
echo.

cd RestaurantPOS.Manager

REM Clean previous build
if exist publish (
    echo Cleaning previous publish...
    rmdir /s /q publish
)

REM Publish
echo Publishing Manager app...
call dotnet publish -c Release -o publish

if %errorLevel% == 0 (
    echo [OK] Manager build successful!
    
    REM Copy to main dist folder
    echo Copying publish files...
    xcopy /E /I /Y publish ..\dist\manager
    echo [OK] Files copied to dist/manager
) else (
    echo [ERROR] Manager build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [5/5] Creating deployment package...
echo.

REM Copy configuration files
echo Copying configuration files...
copy RestaurantPOS.API\appsettings.json dist\backend\ >nul
copy restaurant-pos-client\.env.production dist\frontend\.env >nul 2>&1

REM Create README for deployment
(
echo ========================================
echo  Restaurant POS - Production Build
echo ========================================
echo.
echo Build Date: %date% %time%
echo Version: 2.0.0
echo.
echo Contents:
echo - frontend/ - React production build
echo - backend/  - .NET published app
echo - desktop/  - WPF Desktop POS app
echo - manager/  - WPF Manager Admin app
echo.
echo Deployment Instructions:
echo.
echo Frontend:
echo 1. Upload contents of frontend/ to web server
echo 2. Configure web server to serve index.html
echo 3. Ensure proper CORS settings
echo.
echo Backend:
echo 1. Upload contents of backend/ to server
echo 2. Install .NET 8.0 Runtime on server
echo 3. Configure IIS/nginx/Apache
echo 4. Update appsettings.json with production values
echo 5. Setup SQL Server connection
echo 6. Run migrations on production database
echo.
echo Desktop:
echo 1. Copy contents of desktop/ to client machines
echo 2. Install .NET Desktop Runtime
echo 3. Configure appsettings.json to point to Backend API
echo 4. Run RestaurantPOS.Desktop.exe
echo.
echo Manager:
echo 1. Copy contents of manager/ to admin machines
echo 2. Install .NET Desktop Runtime
echo 3. Configure appsettings.json to point to Backend API
echo 4. Run RestaurantPOS.Manager.exe
echo.
echo For detailed instructions, see:
echo - doc/DEPLOYMENT.md
echo.
echo ========================================
) > dist\README.txt

echo.
echo ========================================
echo  Build Complete!
echo ========================================
echo.
echo Build output location: dist/
echo.
echo Contents:
echo - dist/frontend/ - Frontend production build
echo - dist/backend/  - Backend published files
echo - dist/desktop/  - Desktop POS application
echo - dist/manager/  - Manager Admin application
echo - dist/README.txt - Deployment instructions
echo.
echo Next steps:
echo 1. Review dist/README.txt
echo 2. Test the builds locally
echo 3. Deploy to production server
echo.
echo Size report:
dir dist /s | find "File(s)"
echo.
echo ========================================
echo.

REM Create zip file (requires 7-zip or PowerShell)
choice /C YN /M "Create deployment package (.zip)?"
if %errorLevel% == 1 (
    echo.
    echo Creating zip file...
    powershell Compress-Archive -Path dist\* -DestinationPath RestaurantPOS-v2.0.0-production.zip -Force
    if exist RestaurantPOS-v2.0.0-production.zip (
        echo [OK] Deployment package created!
        echo File: RestaurantPOS-v2.0.0-production.zip
    ) else (
        echo [WARNING] Failed to create zip file
        echo Please create it manually
    )
)

echo.
pause
