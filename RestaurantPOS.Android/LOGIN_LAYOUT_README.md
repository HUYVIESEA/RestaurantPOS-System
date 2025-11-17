# Layout Đăng Nhập Android - Restaurant POS

## Tổng Quan
Layout đăng nhập Android được thiết kế dựa trên giao diện web client với đầy đủ các tính năng và màu sắc tương ứng.

## Cấu Trúc File

### Layout Files
- **activity_login.xml** - Layout chính cho màn hình đăng nhập
  - ScrollView để hỗ trợ các thiết bị màn hình nhỏ
  - CardView cho giao diện hiện đại
  - TextInputLayout với Material Design
  - Progress bar cho trạng thái loading
  - Demo account info card

### Drawable Resources
- **gradient_background.xml** - Background gradient màu vàng (giống web)
- **error_background.xml** - Background cho thông báo lỗi
- **code_background.xml** - Background cho text code (demo credentials)

### Java Files
- **LoginActivity.java** - Activity xử lý logic đăng nhập
  - Validation form
  - Xử lý trạng thái loading
  - Hiển thị thông báo lỗi
  - Navigate sau khi đăng nhập thành công

### Resource Files
- **colors.xml** - Định nghĩa màu sắc theo theme của web
  - Bun Yellow (#FFD54F)
  - Bun Green (#2E7D32)
  - Bun Brown (#6D4C41)
  - Text colors, border colors, status colors
  
- **strings.xml** - Quản lý các chuỗi text
  - Labels
  - Error messages
  - Success messages

## Tính Năng

### UI Components
✅ Logo và tiêu đề app (🍽️ Restaurant POS)
✅ Form đăng nhập với Material Design
✅ Input validation
✅ Password toggle (show/hide)
✅ Loading state với progress bar
✅ Error message display
✅ Forgot password link
✅ Register link
✅ Demo account credentials display

### Màu Sắc & Theme
- Background: Gradient vàng (#FFD54F → #FFE27A)
- Primary Button: Màu xanh lá (#2E7D32)
- Error: Màu đỏ (#D32F2F)
- Text: Đen (#212121) và xám (#757575)

### Responsive Design
- ScrollView để hỗ trợ keyboard
- Layout linh hoạt với ConstraintLayout
- Padding và margin tối ưu cho mobile

## Tài Khoản Demo
```
Username: admin
Password: Admin@123
```

## Cách Sử Dụng

### 1. Build Project
```bash
./gradlew clean build
```

### 2. Run on Device/Emulator
```bash
./gradlew installDebug
```

### 3. Tích Hợp API (Tương Lai)

Để tích hợp với backend API, cần thêm:

#### a. Dependencies trong `build.gradle.kts`:
```kotlin
dependencies {
    // Retrofit for API calls
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    // OkHttp for networking
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
}
```

#### b. Tạo API Service:
```java
public interface AuthService {
    @POST("api/auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);
}
```

#### c. Update LoginActivity để gọi API thật thay vì `simulateLogin()`

## Cải Tiến Trong Tương Lai

### Security
- [ ] Implement proper token storage (SharedPreferences/Encrypted)
- [ ] Add biometric authentication
- [ ] Implement SSL pinning

### UX Improvements
- [ ] Add smooth animations
- [ ] Implement "Remember Me" functionality
- [ ] Add social login options

### Features
- [ ] Complete Forgot Password flow
- [ ] Complete Registration flow
- [ ] Add multi-language support
- [ ] Offline mode support

## Screenshot Flow

1. **Login Screen** - Hiển thị form với gradient background
2. **Loading State** - Progress bar khi đang đăng nhập
3. **Error State** - Thông báo lỗi khi sai thông tin
4. **Success** - Navigate to MainActivity

## Lưu Ý Quan Trọng

⚠️ **Security Note**: 
- Hiện tại đang auto-fill demo credentials cho development
- Xóa hàm `fillDemoCredentials()` trong production
- Implement proper authentication với JWT tokens

⚠️ **Network Note**:
- `usesCleartextTraffic="true"` chỉ dùng cho development
- Remove trong production và dùng HTTPS

## Liên Hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository.
