---
description: Chạy dự án ở chế độ development
---

# Run Development Servers

Workflow này hướng dẫn cách chạy các thành phần của dự án trong môi trường development.

## Option 1: Chạy tất cả (Recommended)

### Sử dụng script có sẵn

```powershell
.\run.bat
```

Script này sẽ tự động:
- Start Backend API
- Start Frontend Client
- Mở browser

## Option 2: Chạy thủ công từng phần

### 1. Start Backend API

**Terminal 1:**
```powershell
cd RestaurantPOS.API
dotnet run --launch-profile LAN
```

API sẽ chạy tại:
- Local: `http://localhost:5000`
- Swagger: `http://localhost:5000/swagger`
- LAN: `http://YOUR_IP:5000`

### 2. Start Frontend Client

**Terminal 2:**
```powershell
cd restaurant-pos-client
npm run dev
```

Client sẽ chạy tại:
- Local: `http://localhost:5173`
- LAN: `http://YOUR_IP:5173`

### 3. Run Android App

**Option A: Android Studio**
- Mở Android Studio
- Open project: `RestaurantPOS.Android`
- Click Run (Shift+F10)
- Chọn device/emulator

**Option B: Command Line**
```powershell
cd RestaurantPOS.Android
.\gradlew installDebug
```

## Option 3: Chạy Manager (Deprecated)

```powershell
.\start-manager.bat
```

hoặc

```powershell
cd RestaurantPOS.Manager
dotnet run
```

## Access Application

### Default Login Credentials

**Admin Account:**
```
Email: admin@bundaumet.com
Password: Admin@123
```

**Manager Account:**
```
Email: manager@bundaumet.com
Password: Manager@123
```

**Staff Account:**
```
Email: staff@bundaumet.com
Password: Staff@123
```

### URLs

**Local Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

**LAN Access (từ thiết bị khác):**
- Frontend: http://[YOUR_IP]:5173
- Backend API: http://[YOUR_IP]:5000

Để biết IP của máy:
```powershell
ipconfig
```
Tìm "IPv4 Address" (thường dạng 192.168.x.x)

## Development Tools

### Hot Reload

**Backend (.NET):**
- Tự động reload khi save file
- Hoặc dùng: `dotnet watch run`

**Frontend (Vite):**
- Tự động reload (HMR - Hot Module Replacement)

**Android:**
- Apply Changes (Ctrl+F10)
- Hot Swap

### Debug Mode

**Backend:**
```powershell
# Visual Studio: F5
# VS Code: F5 với launch.json
dotnet run --configuration Debug
```

**Frontend:**
- Mở Chrome DevTools (F12)
- Dùng React DevTools extension

**Android:**
- Debug mode tự động khi run từ Android Studio
- Attach debugger

## Monitoring

### Check Backend Health
```powershell
curl http://localhost:5000/health
```

### Check Database
```powershell
cd RestaurantPOS.API
dotnet ef database update --verbose
```

### View Logs

**Backend:**
- Logs hiển thị trong terminal
- Check file logs (nếu có)

**Frontend:**
- Browser Console (F12)

## Troubleshooting

### Port Already in Use

**Backend (port 5000):**
```powershell
# Find process using port
netstat -ano | findstr :5000
# Kill process
taskkill /PID <PID> /F
```

**Frontend (port 5173):**
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Database Connection Issues
```powershell
cd RestaurantPOS.API
dotnet ef database update
```

### API Not Responding
- Kiểm tra firewall
- Kiểm tra `.env` configuration
- Restart API server

### CORS Issues
- Đảm bảo CORS được config đúng trong `Program.cs`
- Kiểm tra frontend API URL trong `.env`

## Stop Servers

**Windows:**
- Ctrl+C trong terminal
- Hoặc đóng terminal

**Kill all processes:**
```powershell
# Kill dotnet processes
taskkill /IM dotnet.exe /F
# Kill node processes
taskkill /IM node.exe /F
```

## Next Steps

- Khi development xong, chạy `/build-production` để build production
- Để deploy, chạy `/deploy-production`
