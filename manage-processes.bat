@echo off
REM Script to manage Restaurant POS processes

echo ========================================
echo Restaurant POS - Process Manager
echo ========================================
echo.

:menu
echo.
echo 1. Start API
echo 2. Start Desktop App
echo 3. Start Both (API + Desktop)
echo 4. Stop API (Port 5000)
echo 5. Stop Desktop App
echo 6. Stop All
echo 7. Check Status
echo 8. Exit
echo.
set /p choice="Choose an option (1-8): "

if "%choice%"=="1" goto start_api
if "%choice%"=="2" goto start_desktop
if "%choice%"=="3" goto start_both
if "%choice%"=="4" goto stop_api
if "%choice%"=="5" goto stop_desktop
if "%choice%"=="6" goto stop_all
if "%choice%"=="7" goto check_status
if "%choice%"=="8" goto end

echo Invalid choice!
goto menu

:start_api
echo.
echo Starting API...
start "Restaurant POS API" cmd /k "cd RestaurantPOS.API && dotnet run"
timeout /t 3 >nul
goto menu

:start_desktop
echo.
echo Starting Desktop App...
start "Restaurant POS Desktop" cmd /k "cd RestaurantPOS.Desktop && dotnet run"
timeout /t 2 >nul
goto menu

:start_both
echo.
echo Starting API...
start "Restaurant POS API" cmd /k "cd RestaurantPOS.API && dotnet run"
echo Waiting for API to start...
timeout /t 5 >nul
echo Starting Desktop App...
start "Restaurant POS Desktop" cmd /k "cd RestaurantPOS.Desktop && dotnet run"
goto menu

:stop_api
echo.
echo Finding processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Stopping process %%a...
    taskkill /F /PID %%a 2>nul
)
echo Done!
goto menu

:stop_desktop
echo.
echo Stopping Desktop App...
taskkill /F /IM RestaurantPOS.Desktop.exe 2>nul
if errorlevel 1 (
    echo No Desktop App process found.
) else (
    echo Desktop App stopped!
)
goto menu

:stop_all
echo.
echo Stopping all processes...
call :stop_api
call :stop_desktop
echo All processes stopped!
goto menu

:check_status
echo.
echo ========================================
echo Current Status
echo ========================================
echo.
echo API (Port 5000):
netstat -ano | findstr :5000 | findstr LISTENING
if errorlevel 1 echo   Not running
echo.
echo Desktop App:
tasklist | findstr RestaurantPOS.Desktop.exe
if errorlevel 1 echo   Not running
echo.
goto menu

:end
echo.
echo Goodbye!
timeout /t 2 >nul
exit
