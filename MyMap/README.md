# MyMap - Ứng dụng Demo Google Maps

Ứng dụng Android demo cho phép:
- ✅ Lấy vị trí hiện tại
- ✅ Thêm điểm đánh dấu (markers) trên bản đồ
- ✅ Vẽ đường kết nối giữa các điểm
- ✅ Tính khoảng cách giữa các điểm

## Tính năng chính

### 1. Lấy vị trí hiện tại
- Nhấn nút **"Lấy vị trí hiện tại"** để định vị GPS của bạn
- Bản đồ sẽ di chuyển đến vị trí hiện tại
- Hiển thị tọa độ (latitude, longitude) ở phía dưới

### 2. Thêm điểm đánh dấu
- **Cách 1**: Chạm trực tiếp vào bản đồ
- **Cách 2**: Nhấn nút **"Thêm điểm đánh dấu"** để thêm marker tại vị trí hiện tại
- Mỗi điểm sẽ có màu khác nhau
- Hiển thị tọa độ khi chạm vào marker

### 3. Vẽ đường giữa các điểm
- Thêm ít nhất 2 điểm trên bản đồ
- Nhấn nút **"Vẽ đường giữa các điểm"**
- Ứng dụng sẽ:
  - Vẽ đường màu xanh kết nối tất cả các điểm
  - Tính toán tổng khoảng cách (km)
  - Hiển thị thông tin khoảng cách

### 4. Xóa tất cả
- Nhấn nút **"Xóa tất cả"** để xóa tất cả markers và đường vẽ
- Bắt đầu lại từ đầu

## Cấu hình dự án

### Dependencies đã thêm:
```kotlin
// Google Maps & Location Services
implementation("com.google.android.gms:play-services-maps:18.2.0")
implementation("com.google.android.gms:play-services-location:21.0.1")
```

### Quyền cần thiết (Permissions):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Google Maps API Key:
API Key đã được cấu hình trong `AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="AIzaSyAh7lGjncSHsFElj0L1jFvOY-d4gfLHQMk"/>
```

## Cách build và chạy

### Yêu cầu:
1. **Android Studio** (phiên bản mới nhất)
2. **JDK 11** hoặc cao hơn
3. Thiết bị Android hoặc Emulator với Google Play Services

### Các bước:
1. Mở dự án trong Android Studio
2. Chờ Gradle sync hoàn tất
3. Kết nối thiết bị Android hoặc khởi động emulator
4. Nhấn **Run** (Shift+F10)
5. Cấp quyền truy cập vị trí khi ứng dụng yêu cầu

## Cấu trúc code

### MainActivity.java
Chức năng chính:
- `onMapReady()`: Khởi tạo bản đồ
- `getCurrentLocation()`: Lấy vị trí GPS hiện tại
- `addMarker()`: Thêm điểm đánh dấu
- `drawRoute()`: Vẽ đường và tính khoảng cách
- `clearAll()`: Xóa tất cả markers và polylines

### activity_main.xml
Giao diện gồm:
- Google Map Fragment (hiển thị bản đồ)
- 4 nút điều khiển
- TextView hiển thị thông tin

## Lưu ý

⚠️ **Quan trọng**: 
- Đảm bảo bật GPS trên thiết bị
- Cấp quyền truy cập vị trí cho ứng dụng
- Cần kết nối Internet để tải bản đồ
- Google Maps API Key cần được cấu hình đúng

## Công nghệ sử dụng

- **Android SDK**: API Level 24+ (Android 7.0+)
- **Google Maps SDK for Android**
- **Google Play Services Location**
- **Java 11**
- **Gradle 8.x**

## Tác giả

Restaurant POS System - MyMap Demo

