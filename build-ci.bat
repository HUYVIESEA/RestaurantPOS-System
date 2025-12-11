@echo off
REM ============================================
REM Restaurant POS System - Automated Build
REM ============================================

echo.
echo ========================================
echo  Restaurant POS - Automated Build
echo ========================================
echo.

REM Create output directory
if not exist "dist" mkdir dist

echo.
echo [1/5] Building Frontend...
echo.

cd restaurant-pos-client
if exist dist (
    echo Cleaning previous frontend build...
    rmdir /s /q dist
)
echo Running npm build...
call npm run build
if %errorLevel% NEQ 0 (
    echo [ERROR] Frontend build failed!
    exit /b 1
)
echo Copying frontend files...
xcopy /E /I /Y dist ..\dist\frontend
cd ..

echo.
echo [2/5] Building Backend...
echo.

cd RestaurantPOS.API
if exist publish (
    echo Cleaning previous backend build...
    rmdir /s /q publish
)
echo Publishing Backend...
call dotnet publish -c Release -o publish
if %errorLevel% NEQ 0 (
    echo [ERROR] Backend build failed!
    exit /b 1
)
echo Copying backend files...
xcopy /E /I /Y publish ..\dist\backend
cd ..

echo.
echo [3/5] Building Desktop...
echo.

cd RestaurantPOS.Desktop
if exist publish (
    echo Cleaning previous desktop build...
    rmdir /s /q publish
)
echo Publishing Desktop...
call dotnet publish -c Release -o publish
if %errorLevel% NEQ 0 (
    echo [ERROR] Desktop build failed!
    exit /b 1
)
echo Copying desktop files...
xcopy /E /I /Y publish ..\dist\desktop
cd ..

echo.
echo [4/5] Building Manager...
echo.

cd RestaurantPOS.Manager
if exist publish (
    echo Cleaning previous manager build...
    rmdir /s /q publish
)
echo Publishing Manager...
call dotnet publish -c Release -o publish
if %errorLevel% NEQ 0 (
    echo [ERROR] Manager build failed!
    exit /b 1
)
echo Copying manager files...
xcopy /E /I /Y publish ..\dist\manager
cd ..

echo.
echo [5/5] Creating deployment package...
echo.

echo Copying config files...
copy RestaurantPOS.API\appsettings.json dist\backend\ >nul
copy restaurant-pos-client\.env.production dist\frontend\.env >nul 2>&1

REM Create README
(
echo ========================================
echo  Restaurant POS - Production Build
echo ========================================
echo.
echo Build Date: %date% %time%
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
echo.
echo Backend:
echo 1. Upload contents of backend/ to server
echo 2. Install .NET Runtime
echo 3. Configure appsettings.json
echo.
echo Desktop:
echo 1. Copy contents of desktop/ to client machines
echo 2. Install .NET Desktop Runtime
echo 3. Configure appsettings.json
echo 4. Run RestaurantPOS.Desktop.exe
echo.
echo Manager:
echo 1. Copy contents of manager/ to admin machines
echo 2. Install .NET Desktop Runtime
echo 3. Configure appsettings.json
echo 4. Run RestaurantPOS.Manager.exe
) > dist\README.txt

REM Zip
echo Creating zip file...
powershell Compress-Archive -Path dist\* -DestinationPath RestaurantPOS-System-Package.zip -Force

echo.
echo [SUCCESS] Build and Package Complete!
echo Package: RestaurantPOS-System-Package.zip
