---
description: Thiết lập môi trường development cho RestaurantPOS System
---

# Setup Development Environment

## Prerequisites Check

Đảm bảo bạn đã cài đặt các công cụ sau:

1. **.NET SDK 8.0+**
   ```powershell
   dotnet --version
   ```
   Nếu chưa có: https://dotnet.microsoft.com/download

2. **Node.js 18.0+**
   ```powershell
   node --version
   npm --version
   ```
   Nếu chưa có: https://nodejs.org/

3. **Android Studio** (cho Android App)
   - Java JDK 17+
   - Android SDK
   - Gradle

4. **Git**
   ```powershell
   git --version
   ```

## Setup Steps

### 1. Clone Repository (nếu chưa có)
```powershell
git clone https://github.com/HUYVESEA0/RestaurantPOS-System.git
cd RestaurantPOS-System
```

### 2. Setup Backend API

```powershell
cd RestaurantPOS.API
```

**Restore packages:**
```powershell
dotnet restore
```

**Setup môi trường:**
- Copy `.env.example` thành `.env`
- Cập nhật các cấu hình trong `.env`

**Kiểm tra database:**
```powershell
dotnet ef database update
```

### 3. Setup Frontend Client

```powershell
cd ..\restaurant-pos-client
```

**Install dependencies:**
```powershell
npm install
```

**Setup môi trường:**
- Tạo file `.env` hoặc `.env.local`
- Cấu hình API URL:
  ```
  VITE_API_URL=http://localhost:5000
  ```

### 4. Setup Android App

```powershell
cd ..\RestaurantPOS.Android
```

**Tạo file `local.properties`:**
```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**Sync Gradle:**
- Mở Android Studio
- File → Open → Chọn thư mục `RestaurantPOS.Android`
- Gradle sẽ tự động sync

### 5. Setup Firewall (cho LAN access)

Chạy script setup firewall:
```powershell
cd ..
.\setup-firewall.bat
```

Hoặc setup thủ công:
```powershell
netsh advfirewall firewall add rule name="Restaurant POS API" dir=in action=allow protocol=TCP localport=5000
netsh advfirewall firewall add rule name="Restaurant POS Client" dir=in action=allow protocol=TCP localport=5173
```

### 6. Verify Setup

**Check Backend:**
```powershell
cd RestaurantPOS.API
dotnet build
```

**Check Frontend:**
```powershell
cd restaurant-pos-client
npm run build
```

**Check Android:**
- Mở Android Studio
- Build → Make Project

## Troubleshooting

### Database Issues
```powershell
# Reset database
cd RestaurantPOS.API
dotnet ef database drop
dotnet ef database update
```

### Node Modules Issues
```powershell
# Clean install
cd restaurant-pos-client
rm -rf node_modules
rm package-lock.json
npm install
```

### Gradle Issues
```powershell
# Clean Gradle cache
cd RestaurantPOS.Android
.\gradlew clean
```

## Next Steps

Sau khi setup xong, chạy workflow `/run-dev` để start development servers.
