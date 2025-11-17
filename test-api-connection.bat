@echo off
echo ========================================
echo Quick Test - Android API Connection
echo ========================================
echo.

echo Your IP: 172.16.10.188
echo API URL: http://172.16.10.188:5000/api/Auth/Login
echo.

echo Testing connection...
echo.

curl -X POST http://172.16.10.188:5000/api/Auth/Login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Admin@123\"}"

echo.
echo.
echo ========================================
echo If you see JSON response with "token",
echo the API is working correctly!
echo ========================================
echo.
pause
