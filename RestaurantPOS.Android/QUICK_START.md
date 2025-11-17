# Quick Start - API Testing

## 🚀 Chạy Backend và Android App

### Bước 1: Khởi động Backend API
```powershell
# Mở terminal 1
cd c:\Users\hhuy0\source\repos\HUYVESEA0\RestaurantPOS-System\RestaurantPOS.API
dotnet run
```

Chờ đến khi thấy:
```
Now listening on: http://localhost:5000
```

### Bước 2: Build Android App
```powershell
# Mở terminal 2
cd c:\Users\hhuy0\source\repos\HUYVESEA0\RestaurantPOS-System\RestaurantPOS.Android
./gradlew clean build
```

### Bước 3: Install lên Emulator
```powershell
./gradlew installDebug
```

Hoặc dùng Android Studio:
- Click Run ▶️
- Chọn Emulator hoặc Device

### Bước 4: Test Login
1. App mở → LoginActivity
2. Form đã auto-fill: `admin` / `Admin@123`
3. Click "Đăng nhập"
4. Xem Logcat để kiểm tra API calls

## 🔍 Kiểm Tra Logs

### Logcat trong Android Studio
```
View → Tool Windows → Logcat
```

Filter by tags:
- `LoginActivity` - Login flow
- `OkHttp` - HTTP requests/responses
- `Retrofit` - API calls

### ADB Command Line
```powershell
# All logs
adb logcat

# Filter by tag
adb logcat -s LoginActivity

# Filter with grep
adb logcat | Select-String "retrofit|okhttp|login"
```

## 🧪 Test Cases

### Test 1: Login Thành Công
**Input:**
- Username: `admin`
- Password: `Admin@123`

**Expected:**
- ✅ Loading spinner hiển thị
- ✅ API call to `POST /api/Auth/Login`
- ✅ Response 200 OK
- ✅ Toast: "Đăng nhập thành công!"
- ✅ Navigate to MainActivity
- ✅ Display user info: "Xin chào, Administrator! Vai trò: Admin"

**Logcat:**
```
D/LoginActivity: Login successful for user: admin
D/OkHttp: --> POST http://10.0.2.2:5000/api/Auth/Login
D/OkHttp: {"username":"admin","password":"Admin@123"}
D/OkHttp: <-- 200 OK
```

### Test 2: Login Thất Bại (Sai Password)
**Input:**
- Username: `admin`
- Password: `wrongpassword`

**Expected:**
- ✅ Loading spinner hiển thị
- ✅ API call to `POST /api/Auth/Login`
- ✅ Response 401 Unauthorized
- ✅ Error message: "Tên đăng nhập hoặc mật khẩu không đúng"
- ✅ Stay on LoginActivity

### Test 3: Backend Không Chạy
**Input:**
- Stop backend API
- Username: `admin`
- Password: `Admin@123`

**Expected:**
- ✅ Loading spinner hiển thị
- ✅ Network error
- ✅ Error message: "Không thể kết nối đến server..."
- ✅ Stay on LoginActivity

**Logcat:**
```
E/LoginActivity: Login API call failed
W/System.err: java.net.UnknownHostException: Unable to resolve host
```

### Test 4: Logout
**Action:**
- Login thành công
- Click "Đăng xuất"

**Expected:**
- ✅ SessionManager.clearSession()
- ✅ Navigate back to LoginActivity
- ✅ Form reset (hoặc auto-fill lại)

### Test 5: Auto-Login (Session Persistence)
**Action:**
- Login thành công
- Close app (swipe away)
- Re-open app

**Expected:**
- ✅ Skip LoginActivity
- ✅ Navigate directly to MainActivity
- ✅ Display saved user info

## 📱 Test Environments

### 1. Android Emulator (Recommended)
- API Base URL: `http://10.0.2.2:5000/api/`
- `10.0.2.2` = localhost của host machine

### 2. Physical Device (Cùng WiFi)
**Cấu hình:**
1. Tìm IP của máy:
```powershell
ipconfig
# Tìm IPv4 Address (vd: 192.168.1.100)
```

2. Cập nhật `build.gradle.kts`:
```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:5000/api/\"")
```

3. Rebuild app:
```powershell
./gradlew clean build
./gradlew installDebug
```

## 🐛 Common Issues

### Issue: "Unable to resolve host"
**Check:**
```powershell
# 1. Backend đang chạy?
curl http://localhost:5000/api/Auth/Login

# 2. Port 5000 open?
netstat -ano | findstr :5000
```

**Fix:**
- Start backend: `dotnet run`
- Check firewall settings

### Issue: "Cleartext HTTP traffic not permitted"
**Fix:** AndroidManifest.xml đã có:
```xml
android:usesCleartextTraffic="true"
```

### Issue: Connection timeout
**Fix:** Increase timeout in RetrofitClient.java:
```java
.connectTimeout(60, TimeUnit.SECONDS)
```

## 📊 API Test với Postman

### 1. Import Collection
File: `doc/postman_collection.json`

### 2. Test Login Endpoint
```
POST http://localhost:5000/api/Auth/Login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}
```

### 3. Expected Response
```json
{
  "id": 1,
  "token": "eyJhbGc...",
  "username": "admin",
  "email": "admin@example.com",
  "fullName": "Administrator",
  "role": "Admin",
  "expiresAt": "2025-11-18T..."
}
```

## ✅ Verification Checklist

Before testing:
- [ ] Backend API running at localhost:5000
- [ ] Android Emulator running
- [ ] Logcat visible
- [ ] Network connection OK

After successful login:
- [ ] Token saved in SharedPreferences
- [ ] User info displayed in MainActivity
- [ ] Can logout and login again
- [ ] Session persists after app restart

## 🎯 Demo Flow

```
1. Start Backend
   ↓
2. Start Emulator
   ↓
3. Install App
   ↓
4. Open App → LoginActivity
   ↓
5. Auto-filled: admin / Admin@123
   ↓
6. Click "Đăng nhập"
   ↓
7. Watch Logcat:
   - Request sent
   - Response received
   - Session saved
   ↓
8. MainActivity displayed
   - "Xin chào, Administrator!"
   - "Vai trò: Admin"
   ↓
9. Click "Đăng xuất"
   ↓
10. Back to LoginActivity
```

## 📞 Support

Nếu gặp vấn đề:
1. Check Logcat
2. Check backend logs
3. Verify network connection
4. Review API_INTEGRATION_GUIDE.md
