---
description: Build toàn bộ dự án cho production deployment
---

# Build Production

Workflow này hướng dẫn build toàn bộ dự án cho production environment.

## Prerequisites

1. Đã chạy `/setup` thành công
2. Đã test application trong development mode
3. Đã chuẩn bị production configuration

## Build Steps

### 1. Clean Previous Builds

```powershell
.\clean.bat
```

Hoặc thủ công:

```powershell
# Clean Backend
cd RestaurantPOS.API
dotnet clean

# Clean Frontend
cd ..\restaurant-pos-client
rm -rf dist
rm -rf node_modules/.vite

# Clean Android
cd ..\RestaurantPOS.Android
.\gradlew clean
```

### 2. Build Backend API

```powershell
cd RestaurantPOS.API
```

**Restore dependencies:**
```powershell
dotnet restore
```

**Build release:**
```powershell
dotnet build --configuration Release
```

**Publish (tạo package deploy):**
```powershell
dotnet publish --configuration Release --output ./publish
```

**Output:** `RestaurantPOS.API/publish/`

**Verify build:**
```powershell
dotnet ./publish/RestaurantPOS.API.dll
```

### 3. Build Frontend Client

```powershell
cd ..\restaurant-pos-client
```

**Install dependencies:**
```powershell
npm ci
```
(Dùng `npm ci` thay vì `npm install` cho production)

**Build production:**
```powershell
npm run build
```

**Output:** `restaurant-pos-client/dist/`

**Verify build:**
```powershell
npm run preview
```

### 4. Build Android App (Optional)

Tham khảo workflow `/build-android` để build release APK.

```powershell
cd ..\RestaurantPOS.Android
.\gradlew assembleRelease
```

## Production Configuration

### Backend Configuration

**File:** `RestaurantPOS.API/appsettings.Production.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=restaurant_prod.db"
  },
  "Jwt": {
    "Key": "YOUR_PRODUCTION_SECRET_KEY",
    "Issuer": "https://your-domain.com",
    "Audience": "https://your-domain.com"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning"
    }
  }
}
```

**Môi trường variables:**
```powershell
$env:ASPNETCORE_ENVIRONMENT = "Production"
```

### Frontend Configuration

**File:** `restaurant-pos-client/.env.production`

```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_TITLE=Restaurant POS
VITE_APP_VERSION=1.0.0
```

### Android Configuration

**File:** `app/build.gradle.kts`

```kotlin
buildTypes {
    release {
        isMinifyEnabled = true
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
        buildConfigField("String", "API_URL", "\"https://your-api-domain.com\"")
    }
}
```

## Optimization

### Backend Optimization

**Enable AOT Compilation (Optional):**
```powershell
dotnet publish --configuration Release --output ./publish /p:PublishAot=false
```

**Trim unused code:**
```powershell
dotnet publish --configuration Release --output ./publish /p:PublishTrimmed=true
```

### Frontend Optimization

**Analyze bundle size:**
```powershell
npm run build -- --mode production --report
```

**Optimize images:**
- Compress images trước khi deploy
- Dùng WebP format
- Tối ưu SVG files

### Android Optimization

**Enable ProGuard/R8:**
```kotlin
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
    }
}
```

## Quality Checks

### Backend Tests

```powershell
cd RestaurantPOS.API
dotnet test
```

### Frontend Tests

```powershell
cd restaurant-pos-client
npm run test
```

### Lint Check

**Backend:**
```powershell
dotnet format --verify-no-changes
```

**Frontend:**
```powershell
npm run lint
```

## Build Artifacts

Sau khi build xong, bạn sẽ có:

```
RestaurantPOS-System/
├── RestaurantPOS.API/publish/          # Backend package
│   ├── RestaurantPOS.API.dll
│   ├── appsettings.json
│   └── wwwroot/
├── restaurant-pos-client/dist/         # Frontend package
│   ├── index.html
│   ├── assets/
│   └── ...
└── RestaurantPOS.Android/app/build/outputs/apk/release/
    └── app-release.apk                 # Android APK
```

## Packaging

### Create Deployment Package

**Option 1: ZIP Archive**
```powershell
# Compress backend
Compress-Archive -Path RestaurantPOS.API\publish\* -DestinationPath RestaurantPOS-API-v1.0.0.zip

# Compress frontend
Compress-Archive -Path restaurant-pos-client\dist\* -DestinationPath RestaurantPOS-Client-v1.0.0.zip
```

**Option 2: Docker (Future)**
```dockerfile
# Backend
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY publish/ /app
WORKDIR /app
ENTRYPOINT ["dotnet", "RestaurantPOS.API.dll"]
```

## Verification Checklist

Trước khi deploy, kiểm tra:

- [ ] Backend build thành công (no errors)
- [ ] Frontend build thành công (no errors)
- [ ] Android APK build thành công (nếu cần)
- [ ] Production configs đã được cập nhật
- [ ] Environment variables đã được set
- [ ] Tests đã pass
- [ ] Không có hardcoded credentials
- [ ] API URLs đã đúng
- [ ] Database migration scripts đã sẵn sàng
- [ ] Backup database hiện tại (nếu upgrade)

## Troubleshooting

### Build Errors

**Backend:**
```powershell
# Xem chi tiết lỗi
dotnet build --verbosity detailed
```

**Frontend:**
```powershell
# Debug build
npm run build -- --debug
```

### Missing Dependencies

**Backend:**
```powershell
dotnet restore --force
```

**Frontend:**
```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

### Memory Issues

**Increase Node memory:**
```powershell
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build
```

## Next Steps

Sau khi build xong:
- Chạy `/deploy-production` để deploy lên server
- Hoặc upload build artifacts lên hosting service
- Setup monitoring và logging
