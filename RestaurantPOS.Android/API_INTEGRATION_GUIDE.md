# API Integration Guide - Restaurant POS Android

## 🎉 Đã Hoàn Thành - Backend API Integration

### ✅ Files Đã Tạo/Cập Nhật

#### 1. Build Configuration
- **build.gradle.kts** - Thêm dependencies và BuildConfig
  - Retrofit 2.9.0
  - OkHttp 4.12.0
  - Gson 2.10.1
  - API Base URL configuration

#### 2. Model Classes (`models/`)
- **LoginRequest.java** - Request model cho login API
- **LoginResponse.java** - Response model từ API
- **ErrorResponse.java** - Error handling model

#### 3. API Layer (`api/`)
- **AuthApi.java** - Retrofit interface cho Auth endpoints
- **RetrofitClient.java** - Singleton Retrofit client với logging

#### 4. Utilities (`utils/`)
- **SessionManager.java** - Quản lý session và SharedPreferences
  - Save/retrieve login data
  - Token management
  - User info storage
  - Logout functionality

#### 5. Updated Activities
- **LoginActivity.java** - Tích hợp API login thật
- **MainActivity.java** - Check session và hiển thị user info

## 🔧 Cấu Hình API

### Base URL Configuration

```kotlin
// build.gradle.kts
buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:5000/api/\"")
```

**Lưu ý:** 
- `10.0.2.2` là địa chỉ localhost khi chạy Android Emulator
- Nếu test trên thiết bị thật, dùng IP thực của máy (vd: `192.168.1.100:5000`)

### API Endpoints

```java
// AuthApi.java
@POST("Auth/Login")
Call<LoginResponse> login(@Body LoginRequest request);
```

Tương ứng với backend: `POST http://localhost:5000/api/Auth/Login`

## 📱 Workflow

### 1. App Launch
```
App Start
    ↓
SessionManager.isLoggedIn()?
    ↓           ↓
   YES         NO
    ↓           ↓
MainActivity  LoginActivity
```

### 2. Login Flow
```
User nhập credentials
    ↓
Validate input
    ↓
Show loading
    ↓
Call API: POST /Auth/Login
    ↓
Response?
    ↓              ↓
Success (200)   Error (401/500)
    ↓              ↓
Save to Session  Show error message
    ↓
Navigate to MainActivity
```

### 3. Logout Flow
```
User click Logout
    ↓
SessionManager.clearSession()
    ↓
Navigate to LoginActivity
```

## 🔐 Session Management

### Save Login Data
```java
SessionManager sessionManager = new SessionManager(context);
sessionManager.saveLoginSession(loginResponse);
```

### Check Login Status
```java
if (sessionManager.isLoggedIn()) {
    // User is logged in
    String token = sessionManager.getToken();
    String fullName = sessionManager.getFullName();
}
```

### Logout
```java
sessionManager.clearSession();
```

## 🌐 Retrofit Configuration

### HTTP Logging
```java
HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
```

Logs sẽ hiển thị trong Logcat:
- Request URL
- Request Headers
- Request Body
- Response Code
- Response Body

### Timeout Settings
```java
OkHttpClient okHttpClient = new OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    .build();
```

## 🧪 Testing

### 1. Chạy Backend API
```bash
cd RestaurantPOS.API
dotnet run
```

Backend sẽ chạy tại: `http://localhost:5000`

### 2. Chạy Android App
```bash
cd RestaurantPOS.Android
./gradlew clean build
./gradlew installDebug
```

### 3. Kiểm Tra Logs
```bash
# Filter by tag
adb logcat -s LoginActivity

# Full logs
adb logcat | grep -i "retrofit\|okhttp\|login"
```

### 4. Demo Credentials
```
Username: admin
Password: Admin@123
```

## ⚠️ Troubleshooting

### Issue 1: "Unable to resolve host"
**Nguyên nhân:** Backend không chạy hoặc URL sai

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://localhost:5000/api/Auth/Login`
2. Với Emulator: dùng `10.0.2.2`
3. Với thiết bị thật: dùng IP thực (vd: `192.168.1.100`)

### Issue 2: "Cleartext traffic not permitted"
**Nguyên nhân:** Android không cho phép HTTP (chỉ HTTPS)

**Giải pháp:** 
AndroidManifest.xml đã có `android:usesCleartextTraffic="true"` (chỉ dùng cho development)

### Issue 3: Connection timeout
**Nguyên nhân:** Backend chậm hoặc network issue

**Giải pháp:**
- Tăng timeout trong RetrofitClient
- Kiểm tra firewall
- Kiểm tra backend logs

### Issue 4: 401 Unauthorized
**Nguyên nhân:** Sai credentials hoặc token hết hạn

**Giải pháp:**
- Kiểm tra username/password
- Clear app data và login lại

## 📊 API Response Examples

### Successful Login
```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "admin",
  "email": "admin@example.com",
  "fullName": "Administrator",
  "role": "Admin",
  "expiresAt": "2025-11-18T10:30:00Z"
}
```

### Failed Login
```json
{
  "message": "Tên đăng nhập hoặc mật khẩu không đúng"
}
```

## 🚀 Next Steps

### Future API Endpoints to Add:

#### 1. Products
```java
@GET("Products")
Call<List<Product>> getProducts();

@POST("Products")
Call<Product> createProduct(@Body Product product);
```

#### 2. Orders
```java
@GET("Orders")
Call<List<Order>> getOrders();

@POST("Orders")
Call<Order> createOrder(@Body Order order);
```

#### 3. Tables
```java
@GET("Tables")
Call<List<Table>> getTables();

@PUT("Tables/{id}")
Call<Table> updateTable(@Path("id") int id, @Body Table table);
```

#### 4. Categories
```java
@GET("Categories")
Call<List<Category>> getCategories();
```

### Add Authorization Header
```java
public class AuthInterceptor implements Interceptor {
    private SessionManager sessionManager;
    
    @Override
    public Response intercept(Chain chain) throws IOException {
        Request original = chain.request();
        
        Request.Builder requestBuilder = original.newBuilder()
            .header("Authorization", "Bearer " + sessionManager.getToken());
            
        return chain.proceed(requestBuilder.build());
    }
}
```

## 📝 Security Notes

### ⚠️ Current (Development)
- ✅ Auto-fill credentials for testing
- ✅ HTTP allowed (cleartext traffic)
- ✅ Detailed logging enabled
- ✅ Token stored in SharedPreferences (plain)

### 🔒 Production Ready
- [ ] Remove auto-fill credentials
- [ ] Use HTTPS only
- [ ] Disable detailed logging
- [ ] Encrypt tokens (Android Keystore)
- [ ] Implement refresh token
- [ ] Add certificate pinning
- [ ] Add ProGuard rules

## 📖 Documentation

### SharedPreferences Keys
```
KEY_TOKEN = "token"
KEY_USER_ID = "user_id"
KEY_USERNAME = "username"
KEY_EMAIL = "email"
KEY_FULL_NAME = "full_name"
KEY_ROLE = "role"
KEY_EXPIRES_AT = "expires_at"
KEY_IS_LOGGED_IN = "is_logged_in"
```

### BuildConfig Variables
```
BuildConfig.API_BASE_URL = "http://10.0.2.2:5000/api/"
BuildConfig.DEBUG = true
```

## ✅ Checklist

- [x] Retrofit setup
- [x] OkHttp logging
- [x] Model classes
- [x] API interface
- [x] SessionManager
- [x] Login integration
- [x] Logout functionality
- [x] Error handling
- [x] Loading states
- [ ] Refresh token
- [ ] Other API endpoints
- [ ] Offline support
- [ ] Unit tests

## 🎯 Kết Quả

Android app đã được tích hợp hoàn toàn với backend API:
- ✨ Login với API thật
- 🔐 Session management
- 💾 Token persistence
- 🐛 Error handling
- 📡 Network logging
- 🔄 Auto-login check
