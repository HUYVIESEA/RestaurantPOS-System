---
description: Build và deploy ứng dụng Android
---

# Build Android Application

Workflow này hướng dẫn build ứng dụng Android cho RestaurantPOS System.

## Prerequisites

1. **Android Studio** đã được cài đặt
2. **JDK 17+** đã được cài đặt
3. **Android SDK** đã được setup
4. **Gradle** (đi kèm với Android Studio)

## Build Variants

Dự án có 2 build variants chính:
- **debug**: Cho development và testing
- **release**: Cho production

## Build Debug APK

### Option 1: Android Studio (Recommended)

1. Mở Android Studio
2. Open project: `RestaurantPOS.Android`
3. Build → Build Bundle(s) / APK(s) → Build APK(s)
4. Đợi build hoàn tất
5. APK sẽ nằm tại: `app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line

```powershell
cd RestaurantPOS.Android
.\gradlew assembleDebug
```

**Output:** `app/build/outputs/apk/debug/app-debug.apk`

## Build Release APK

### 1. Setup Keystore (lần đầu tiên)

**Tạo keystore:**
```powershell
keytool -genkey -v -keystore restaurant-pos.keystore -alias restaurantpos -keyalg RSA -keysize 2048 -validity 10000
```

Điền thông tin:
- Password: [Mật khẩu của bạn]
- Name: Restaurant POS
- Organizational Unit: Development
- Organization: Your Company
- City/Locality: Hanoi
- State/Province: Hanoi
- Country Code: VN

**Lưu keystore:**
- Copy `restaurant-pos.keystore` vào thư mục `RestaurantPOS.Android/`
- KHÔNG commit file này lên Git!

### 2. Cấu hình Gradle

**Tạo file `keystore.properties`:**
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=restaurantpos
storeFile=restaurant-pos.keystore
```

**QUAN TRỌNG:** Thêm vào `.gitignore`:
```
keystore.properties
*.keystore
*.jks
```

### 3. Build Release APK

**Option A: Android Studio**
1. Build → Generate Signed Bundle / APK
2. Chọn APK → Next
3. Chọn keystore file
4. Nhập passwords
5. Build Variants: release
6. Signature Versions: V1, V2
7. Finish

**Option B: Command Line**
```powershell
cd RestaurantPOS.Android
.\gradlew assembleRelease
```

**Output:** `app/build/outputs/apk/release/app-release.apk`

## Build AAB (Android App Bundle)

Android App Bundle là format preferred cho Google Play Store.

### Build Debug AAB
```powershell
.\gradlew bundleDebug
```

### Build Release AAB
```powershell
.\gradlew bundleRelease
```

**Output:** `app/build/outputs/bundle/release/app-release.aab`

## Testing APK

### Install trên Device/Emulator

**Option 1: Android Studio**
- Right-click APK → Run

**Option 2: ADB**
```powershell
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Reinstall (ghi đè):**
```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Uninstall
```powershell
adb uninstall com.example.restaurantpos.restaurantpo
```

## Configuration

### Update API URL

**File:** `app/src/main/java/com/example/restaurantpos/restaurantpo/smartorder/data/remote/retrofit/RetrofitInstance.kt`

```kotlin
private const val BASE_URL = "http://YOUR_SERVER_IP:5000/"
```

**Cho development:** Dùng IP máy local
**Cho production:** Dùng domain/IP server thật

### Update App Version

**File:** `app/build.gradle.kts`

```kotlin
defaultConfig {
    applicationId = "com.example.restaurantpos.restaurantpo"
    versionCode = 1  // Tăng mỗi lần release
    versionName = "1.0.0"  // Semantic versioning
}
```

## Clean Build

### Clean Gradle Cache
```powershell
cd RestaurantPOS.Android
.\gradlew clean
```

### Clean + Rebuild
```powershell
.\gradlew clean assembleDebug
```

### Invalidate Caches (Android Studio)
1. File → Invalidate Caches
2. Chọn: Invalidate and Restart

## Troubleshooting

### Build Failed

**Check Java Version:**
```powershell
java -version
```
Cần JDK 17+

**Check Gradle:**
```powershell
.\gradlew --version
```

**Sync Gradle:**
- Android Studio: File → Sync Project with Gradle Files

### Keystore Issues

**Quên password:**
- Không thể recover, phải tạo keystore mới
- LƯU Ý: App với keystore mới sẽ không update được app cũ

**Keystore not found:**
- Kiểm tra đường dẫn trong `keystore.properties`
- Đảm bảo file keystore tồn tại

### Memory Issues

```powershell
# Tăng memory cho Gradle
# File: gradle.properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m
```

### Dependency Issues

```powershell
# Clear Gradle cache
.\gradlew clean
.\gradlew --refresh-dependencies
```

## Distribution

### Share APK file

1. Locate APK: `app/build/outputs/apk/release/app-release.apk`
2. Upload lên:
   - Google Drive
   - Dropbox
   - Internal server
3. Share link với testers

### Upload to Google Play (Future)

1. Tạo Google Play Developer account
2. Tạo app trên Play Console
3. Upload AAB file
4. Setup app info, screenshots
5. Submit for review

## Automation

### Build all variants
```powershell
.\gradlew assemble
```

### Run tests + Build
```powershell
.\gradlew build
```

### Generate reports
```powershell
.\gradlew assembleRelease --scan
```

## Next Steps

- Để test app, sử dụng test devices hoặc emulators
- Để monitor crashes, integrate Firebase Crashlytics
- Để distribute beta, dùng Firebase App Distribution
