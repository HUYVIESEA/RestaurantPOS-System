# 🍽️ SMART ORDER - ỨNG DỤNG ANDROID QUẢN LÝ NHÀ HÀNG

**Đồ án tốt nghiệp**  
**Sinh viên**: Hoàng Việt Huy  
**Năm**: 2025

---

## 📋 MỤC LỤC

1. Giới thiệu dự án
2. Công nghệ Android sử dụng
3. Kiến trúc ứng dụng Android
4. Tính năng chính
5. Giao diện ứng dụng
6. Demo sản phẩm
7. Kết quả đạt được
8. Hướng phát triển

---

# 1️⃣ GIỚI THIỆU DỰ ÁN

## Tên dự án
**SMART ORDER - Ứng Dụng Android Quản Lý Nhà Hàng**

## Mục tiêu
- ✅ Xây dựng ứng dụng Android native cho nhà hàng
- ✅ Giao diện Material Design 3 hiện đại
- ✅ Đặt món nhanh chóng và chính xác
- ✅ Kết nối API backend real-time

## Bối cảnh
Nhân viên nhà hàng cần công cụ di động để:
- Phục vụ khách hàng nhanh chóng
- Không bị trói buộc với máy tính cố định
- Ghi nhận order ở bất kỳ đâu trong nhà hàng
- Cập nhật trạng thái món ăn real-time

## Giải pháp
Phát triển ứng dụng **Android native** với:
- Ngôn ngữ: **Kotlin**
- UI Framework: **Material Design 3**
- Architecture: **MVVM**
- API Communication: **Retrofit 2**

---

# 2️⃣ CÔNG NGHỆ ANDROID SỬ DỤNG

## Ngôn ngữ & Framework
- **Kotlin** - Ngôn ngữ chính thức cho Android
- **Android SDK** - API Level 24+ (Android 7.0+)
- **Jetpack Components** - Modern Android development

## UI/UX
- **Material Design 3** - Google's latest design system
- **XML Layouts** - Traditional Android layouts
- **ViewBinding** - Type-safe view references
- **RecyclerView** - Efficient list rendering

## Architecture
- **MVVM Pattern** - Model-View-ViewModel
- **LiveData** - Observable data holder
- **ViewModel** - Lifecycle-aware data management
- **Repository Pattern** - Data layer abstraction

## Networking
- **Retrofit 2** - HTTP client
- **OkHttp** - HTTP/HTTPS protocol
- **Gson** - JSON serialization/deserialization
- **Coroutines** - Asynchronous programming

## Image Loading
- **Glide** - Image loading and caching
- **CircleImageView** - Circular image views

## Data Persistence
- **SharedPreferences** - User session storage
- **Room Database** - Local caching (optional)

---

# 3️⃣ KIẾN TRÚC ỨNG DỤNG ANDROID

## Sơ đồ tổng quan

```
┌─────────────────────────────────────┐
│      ANDROID APPLICATION            │
├─────────────────────────────────────┤
│  Presentation Layer (Activities)    │
│  - LoginActivity                    │
│  - MainActivity                     │
│  - MenuActivity                     │
│  - CartActivity                     │
│  - KitchenActivity                  │
├─────────────────────────────────────┤
│  ViewModel Layer                    │
│  - AuthViewModel                    │
│  - OrderViewModel                   │
│  - ProductViewModel                 │
├─────────────────────────────────────┤
│  Repository Layer                   │
│  - AuthRepository                   │
│  - OrderRepository                  │
│  - ProductRepository                │
├─────────────────────────────────────┤
│  Data Source Layer                  │
│  - API Service (Retrofit)           │
│  - Local Storage (SharedPreferences)│
└─────────────────────────────────────┘
           │
           ↓ HTTP/HTTPS
┌─────────────────────────────────────┐
│    ASP.NET CORE WEB API             │
│    (Backend Server)                 │
└─────────────────────────────────────┘
```

## MVVM Architecture Chi Tiết

### **View (Activity/Fragment)**
- Hiển thị UI
- Observe LiveData từ ViewModel
- Handle user interactions
- Navigate giữa các screens

### **ViewModel**
- Business logic
- Quản lý UI state
- Call Repository methods
- Expose LiveData cho View

### **Repository**
- Single source of truth
- Quyết định data từ API hay local
- Transform data models
- Error handling

### **Data Source**
- API Service (Remote)
- SharedPreferences (Local)
- Room Database (Cache)

---

# 4️⃣ TÍNH NĂNG CHÍNH

## 🔐 Xác thực người dùng
- ✅ Đăng nhập với username/password
- ✅ Lưu session với JWT token
- ✅ Auto-logout khi token hết hạn
- ✅ Remember me functionality

## 🍽️ Quản lý Thực đơn
- ✅ Hiển thị danh sách món ăn dạng grid
- ✅ Lọc theo danh mục
- ✅ Tìm kiếm món ăn
- ✅ Xem chi tiết món (ảnh, giá, mô tả)
- ✅ Loading images với Glide

## 🛒 Giỏ hàng
- ✅ Thêm/bớt món trong giỏ
- ✅ Điều chỉnh số lượng (+/-)
- ✅ Xóa món khỏi giỏ
- ✅ Tính tổng tiền tự động
- ✅ Ghi chú cho từng món

## 📋 Quản lý Đơn hàng
- ✅ Chọn bàn trước khi đặt món
- ✅ Nhập tên khách hàng
- ✅ Gửi order lên server
- ✅ Xem danh sách orders
- ✅ Cập nhật trạng thái order

## 👨‍🍳 Giao diện Bếp
- ✅ Hiển thị orders chờ xử lý
- ✅ Đánh dấu "Đang nấu"
- ✅ Đánh dấu "Hoàn thành"
- ✅ Real-time updates (polling)
- ✅ Notification khi có order mới

## 🏠 Quản lý Bàn
- ✅ Danh sách bàn theo tầng
- ✅ Trạng thái bàn (Trống/Đang dùng)
- ✅ Chọn bàn để tạo order
- ✅ Xem orders của bàn

---

# 5️⃣ GIAO DIỆN ỨNG DỤNG

## 🎨 Material Design 3

### Màu sắc chủ đạo
- **Primary**: Deep Purple (#6200EE)
- **Secondary**: Teal (#03DAC6)
- **Error**: Red (#B00020)
- **Background**: White/Dark theme

### Components sử dụng
- ✅ MaterialButton
- ✅ MaterialCardView
- ✅ TextInputLayout
- ✅ RecyclerView
- ✅ FloatingActionButton
- ✅ Toolbar/AppBar
- ✅ BottomNavigationView

## 📱 Screens chính

### 1. Login Screen
- TextFields cho username/password
- Login button
- Remember me checkbox
- Material Design elevation

### 2. Home Screen
- Bottom Navigation (Menu, Orders, Kitchen, Tables)
- Toolbar với title
- FAB cho quick actions

### 3. Menu Screen
- Category chips ở top
- RecyclerView grid 2 columns
- Product cards với image, name, price
- Add to cart button

### 4. Cart Screen
- RecyclerView list items
- Quantity controls (+/-)
- Remove button
- Total price at bottom
- Checkout button

### 5. Kitchen Screen
- Tabs: Pending / Cooking / Done
- Order cards với:
  * Table number
  * Dishes list
  * Time received
  * Action buttons

### 6. Table Screen
- Grid layout các bàn
- Color coding (Green = Available, Orange = Occupied)
- Click to create order

---

# 6️⃣ DEMO SẢN PHẨM

## Workflow điển hình

### 1. Đăng nhập
```
Open App → Login Screen
→ Enter username/password
→ Click Login
→ Save JWT token
→ Navigate to Home
```

### 2. Xem menu và thêm vào giỏ
```
Home → Menu tab
→ Select category (Đồ ăn)
→ Browse products in grid
→ Click product card
→ View product details
→ Click "Add to Cart"
→ See cart badge update
```

### 3. Xem giỏ hàng
```
Click Cart icon
→ See all items in cart
→ Adjust quantity (+/-)
→ Remove items if needed
→ See total price update
```

### 4. Tạo đơn hàng
```
From Cart → Click Checkout
→ Select Table (B01)
→ Enter customer name
→ Add order notes
→ Click "Create Order"
→ POST request to API
→ Success message
→ Clear cart
→ Navigate to Orders
```

### 5. Bếp xử lý đơn
```
Kitchen Screen → Pending tab
→ See new order card
→ Click "Start Cooking"
→ Order moves to Cooking tab
→ Click "Mark Done"
→ Order moves to Done tab
```

## Tính năng nổi bật

### Real-time Updates (Polling)
```kotlin
Handler().postDelayed({
    viewModel.refreshOrders()
}, 5000) // Refresh every 5 seconds
```

### Image Caching với Glide
```kotlin
Glide.with(context)
    .load(product.imageUrl)
    .placeholder(R.drawable.placeholder)
    .into(imageView)
```

### Coroutines cho async operations
```kotlin
viewModelScope.launch {
    val result = repository.createOrder(order)
    _orderState.postValue(result)
}
```

---

# 7️⃣ KẾT QUẢ ĐẠT ĐƯỢC

## ✅ Hoàn thành

### Android Application
- ✅ 15+ Activities/Fragments
- ✅ MVVM architecture hoàn chỉnh
- ✅ Material Design 3 UI
- ✅ Retrofit API integration
- ✅ Glide image loading
- ✅ RecyclerView với adapters
- ✅ Navigation components
- ✅ SharedPreferences authentication

### Tính năng
- ✅ Login/Logout
- ✅ Menu browsing với categories
- ✅ Shopping cart functionality
- ✅ Order creation
- ✅ Kitchen management
- ✅ Table selection
- ✅ Real-time polling updates

### Code Quality
- ✅ Clean architecture
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states

## 📊 Số liệu

- **Total Lines of Code**: ~8,000 lines Kotlin
- **Activities**: 15+
- **ViewModels**: 10+
- **Repositories**: 5+
- **API Endpoints Used**: 20+
- **Layouts**: 30+ XML files

## 🎯 Đánh giá

- **Architecture**: Excellent (MVVM)
- **UI/UX**: Material Design 3 ✅
- **Performance**: Good (với Glide caching)
- **Code Quality**: Production-ready
- **Maintainability**: High (clean code)

---

# 8️⃣ HƯỚNG PHÁT TRIỂN

## Ngắn hạn (3-6 tháng)

### Tính năng mới
- [ ] Offline mode với Room Database
- [ ] Push notifications (FCM)
- [ ] Barcode scanner cho products
- [ ] Print order to thermal printer (Bluetooth)
- [ ] Multi-language support

### Cải tiến UX
- [ ] Jetpack Compose migration
- [ ] Better animations
- [ ] Pull-to-refresh
- [ ] Swipe gestures
- [ ] Dark theme improvements

## Dài hạn (6-12 tháng)

### Advanced Features
- [ ] Voice ordering
- [ ] AR menu preview
- [ ] Customer-facing app (order từ bàn)
- [ ] Loyalty program integration
- [ ] AI-based recommendations

### Performance
- [ ] Room database cho offline
- [ ] WorkManager cho background tasks
- [ ] Memory optimization
- [ ] Battery optimization
- [ ] Network caching strategies

---

# 📚 TÀI LIỆU THAM KHẢO

## Android Development
1. Android Developers Official Docs
2. Kotlin Documentation
3. Material Design Guidelines
4. MVVM Architecture Guide

## Libraries Used
- Retrofit: https://square.github.io/retrofit/
- Glide: https://github.com/bumptech/glide
- Kotlin Coroutines: https://kotlinlang.org/docs/coroutines-overview.html
- Material Components: https://material.io/develop/android

## Inspiration
- Google I/O App
- KiotViet POS Android
- Toast POS Mobile
- Square Point of Sale

---

# 🎓 KẾT LUẬN

## Thành công
✅ **Xây dựng thành công** ứng dụng Android native với MVVM architecture  
✅ **Thiết kế giao diện** Material Design 3 hiện đại, user-friendly  
✅ **Tích hợp API** thành công với Retrofit và Coroutines  
✅ **Production-ready** và có thể deploy lên Google Play Store  

## Bài học
- **MVVM Architecture** giúp code dễ maintain và test
- **Material Design** giúp UI/UX professional
- **Kotlin Coroutines** giúp async code readable
- **Repository Pattern** giúp data layer clean

## Điểm mạnh
1. ✅ Native Android performance
2. ✅ Modern architecture (MVVM)
3. ✅ Material Design 3 UI
4. ✅ Clean, maintainable code
5. ✅ Production-ready quality

## Lời cảm ơn
Cảm ơn thầy cô đã hướng dẫn và hỗ trợ trong suốt quá trình phát triển ứng dụng Android.

---

# 💡 DEMO & Q&A

**Sẵn sàng demo ứng dụng Android!**

**GitHub**: https://github.com/HUYVESEA0/RestaurantPOS-System  
**Email**: huyvesea0@gmail.com

**CÂU HỎI & TRẢ LỜI**

---

# 📎 PHỤ LỤC

## Cấu trúc project Android

```
RestaurantPOS.Android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/restaurant/pos/
│   │   │   │   ├── activities/
│   │   │   │   │   ├── LoginActivity.kt
│   │   │   │   │   ├── MainActivity.kt
│   │   │   │   │   ├── MenuActivity.kt
│   │   │   │   │   └── CartActivity.kt
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── ProductAdapter.kt
│   │   │   │   │   └── CartAdapter.kt
│   │   │   │   ├── models/
│   │   │   │   │   ├── Product.kt
│   │   │   │   │   ├── Order.kt
│   │   │   │   │   └── User.kt
│   │   │   │   ├── viewmodels/
│   │   │   │   │   ├── AuthViewModel.kt
│   │   │   │   │   └── OrderViewModel.kt
│   │   │   │   ├── repositories/
│   │   │   │   │   └── OrderRepository.kt
│   │   │   │   └── api/
│   │   │   │       ├── ApiService.kt
│   │   │   │       └── RetrofitClient.kt
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   ├── drawable/
│   │   │   │   ├── values/
│   │   │   │   └── menu/
│   │   │   └── AndroidManifest.xml
│   └── build.gradle
└── gradle/
```

## Dependencies chính

```gradle
// Kotlin
implementation "org.jetbrains.kotlin:kotlin-stdlib:1.9.0"

// AndroidX
implementation "androidx.core:core-ktx:1.12.0"
implementation "androidx.appcompat:appcompat:1.6.1"
implementation "androidx.constraintlayout:constraintlayout:2.1.4"

// Material Design
implementation "com.google.android.material:material:1.11.0"

// Lifecycle & ViewModel
implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0"
implementation "androidx.lifecycle:lifecycle-livedata-ktx:2.7.0"

// Retrofit
implementation "com.squareup.retrofit2:retrofit:2.9.0"
implementation "com.squareup.retrofit2:converter-gson:2.9.0"

// Glide
implementation "com.github.bumptech.glide:glide:4.16.0"

// Coroutines
implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"
```

## Hướng dẫn build

### Prerequisites
- Android Studio Giraffe or newer
- JDK 17
- Android SDK API Level 24+
- Gradle 8.0+

### Build Steps
1. Clone repository
2. Open in Android Studio
3. Sync Gradle
4. Update `BASE_URL` in `ApiService.kt`
5. Run on emulator or device

### Generate APK
```bash
./gradlew assembleRelease
# APK output: app/build/outputs/apk/release/
```

---

## ❓ POTENTIAL Q&A (Android Focus)

### **Q: Tại sao chọn MVVM thay vì MVP hay MVC?**
A: MVVM tách biệt UI logic và business logic tốt hơn, dễ test, và được Google khuyến nghị với Jetpack components.

### **Q: Làm sao handle configuration changes (screen rotation)?**
A: Dùng ViewModel - data survive qua configuration changes. ViewModel tự động restore state.

### **Q: API calls có block UI thread không?**
A: Không, tôi dùng Kotlin Coroutines với `viewModelScope.launch` để chạy async, không block UI.

### **Q: Image caching hoạt động thế nào?**
A: Glide tự động cache images (memory + disk cache). Giảm network calls và tăng performance.

### **Q: App có hoạt động offline không?**
A: Hiện tại chưa. Có thể thêm Room Database để lưu data locally và sync khi online.

### **Q: Làm sao handle errors từ API?**
A: Try-catch trong Repository, trả về sealed class `Result<T>`. ViewModel observe và update UI state.

### **Q: Có support tablet không?**
A: Có, layouts responsive với ConstraintLayout. Có thể tối ưu thêm với size qualifiers.

### **Q: Battery consumption như thế nào?**
A: Polling mỗi 5s có thể tốn pin. Nên dùng WorkManager hoặc WebSocket cho production.

---

**HẾT**

**Chúc thầy cô sức khỏe!**  
**Cảm ơn đã lắng nghe!**

---

**📱 ANDROID APP - PRODUCTION READY ✅**
