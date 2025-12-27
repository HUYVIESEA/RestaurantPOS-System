# BÁO CÁO KỸ THUẬT: HỆ THỐNG RESTAURANT POS

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)
Hệ thống **Restaurant POS System** là một giải pháp quản lý nhà hàng toàn diện, được xây dựng theo mô hình **Client-Server**. Hệ thống tách biệt hoàn toàn giữa phần xử lý logic nghiệp vụ (Backend API) và giao diện người dùng (Frontend Web Client), đảm bảo tính linh hoạt, bảo mật và khả năng mở rộng.

---

## 2. API SERVER (BACKEND)
Phần lõi của hệ thống, chịu trách nhiệm xử lý logic, quản lý dữ liệu và kết nối với các dịch vụ bên thứ ba.

### Công Nghệ Cốt Lõi (Tech Stack)
*   **Framework**: **ASP.NET Core 9.0 (Web API)** – Hiệu năng cao, bảo mật mạnh mẽ.
*   **Ngôn ngữ**: C#.
*   **Cơ sở dữ liệu**: **PostgreSQL** kết hợp với **Entity Framework Core 9.0** (ORM) để thao tác dữ liệu.
*   **Xác thực (Authentication)**: **JWT (JSON Web Token)** Bearer Authentication.
*   **Real-time Communication**: **SignalR** cho các tính năng thời gian thực (ví dụ: thông báo đơn hàng mới).

### Các Module Chính (Controllers)
Hệ thống được chia thành các controller chuyên biệt:
*   **Quản lý nghiệp vụ**: `Orders`, `Products`, `Categories`, `Tables`, `Suppliers`.
*   **Quản lý hệ thống**: `Users`, `Auth` (Đăng nhập/Đăng ký), `Devices` (Quản lý thiết bị).
*   **Thanh toán & Tài chính**: `Payment`, `SePay` (Tích hợp cổng thanh toán), `VietQR` (Tạo mã QR thanh toán), `PaymentSettings`.
*   **Báo cáo**: `Reports` (Doanh thu, thống kê).
*   **Tiện ích**: `Notification` (Thông báo Firebase), `Upload` (Quản lý file/ảnh).

### Điểm Nổi Bật Về Kỹ Thuật
1.  **Kiến trúc Layered**: Sử dụng Pattern **Controller - Service - Repository** (được đăng ký qua Dependency Injection trong `Program.cs`), giúp code dễ bảo trì.
2.  **Tích hợp bên thứ ba**:
    *   **Firebase Admin SDK**: Gửi thông báo đẩy (Push Notifications).
    *   **VietQR & SePay**: Tích hợp thanh toán ngân hàng tự động.
3.  **Cấu hình nâng cao**:
    *   Hỗ trợ **CORS** cho phép kết nối từ Client (Localhost/Production).
    *   **Swagger/OpenAPI**: Tự động sinh tài liệu API.
    *   **Response Compression**: Nén dữ liệu phản hồi để tăng tốc độ tải.

---

## 3. WEB CLIENT (FRONTEND)
Giao diện người dùng hiện đại, cung cấp trải nghiệm mượt mà cho nhân viên và quản lý nhà hàng.

### Công Nghệ Cốt Lõi
*   **Framework**: **React 18** với **TypeScript** – Đảm bảo type-safe và hạn chế lỗi runtime.
*   **Build Tool**: **Vite** – Tốc độ build và hot-reload cực nhanh.
*   **Styling**: CSS Modules / Standard CSS (file `index.css`, `App.css`).

### Thư Viện Hỗ Trợ (Key Dependencies)
*   **Giao tiếp API**: `axios` – Xử lý các HTTP Request tới Server.
*   **Real-time**: `@microsoft/signalr` – Kết nối Socket nhận dữ liệu thời gian thực từ Server.
*   **Định tuyến**: `react-router-dom` – Quản lý điều hướng trang (SPA).
*   **Biểu đồ & Báo cáo**: `chart.js`, `react-chartjs-2`, `recharts` – Hiển thị biểu đồ doanh thu trực quan.
*   **Tiện ích khác**: `date-fns` (xử lý ngày giờ), `fontawesome` (icon).

### Cấu Trúc Source Code (`src/`)
*   **`components/`**: Chứa các UI component tái sử dụng (Button, Input, Table, etc.).
*   **`services/`**: Các file gọi API, tách biệt logic gọi mạng khỏi giao diện (Service Layer).
*   **`contexts/`**: Quản lý Global State (ví dụ: thông tin User đăng nhập, Giỏ hàng).
*   **`hooks/`**: Custom React Hooks để chia sẻ logic giữa các component.
*   **`types/`**: Định nghĩa các Interface/Type TypeScript đồng bộ với Models của Backend.

---

## 4. TỔNG KẾT & TƯƠNG TÁC (INTEGRATION)
Sự kết hợp giữa ASP.NET API và React Client tạo nên một hệ thống chặt chẽ:

1.  **Luồng dữ liệu**: Client gửi Request (REST) -> API xử lý & truy vấn DB -> Trả về JSON -> Client hiển thị.
2.  **Thời gian thực**: Khi có đơn hàng mới hoặc cập nhật trạng thái thanh toán, Server bắn signal qua **SignalR Hub**, Client nhận signal và cập nhật giao diện ngay lập tức mà không cần reload trang.
3.  **Bảo mật**: Mọi request từ Client đều được đính kèm **JWT Token** để Server xác thực quyền truy cập.

---

## 5. GIAO DIỆN NGƯỜI DÙNG (USER INTERFACE)
*Phần này mô tả các màn hình chính của ứng dụng Web Client. (Vui lòng chèn ảnh chụp màn hình thực tế của ứng dụng vào các vị trí tương ứng).*

### 5.1. Màn Hình Đăng Nhập (Login)
*   **Chức năng**: Cho phép nhân viên và quản lý đăng nhập vào hệ thống.
*   **Hình ảnh minh họa**:
    > *[Chèn ảnh màn hình Login tại đây - Gợi ý: Chụp giao diện form đăng nhập với email/password]*

### 5.2. Dashboard (Tổng Quan)
*   **Chức năng**: Hiển thị cái nhìn tổng quan về tình hình kinh doanh, biểu đồ doanh thu trong ngày, và các lối tắt nhanh.
*   **Hình ảnh minh họa**:
    > *[Chèn ảnh Dashboard tại đây - Gợi ý: Chụp trang chủ sau khi đăng nhập]*

### 5.3. Quản Lý Bàn (Table Management)
*   **Chức năng**: Sơ đồ bàn ăn, hiển thị trạng thái bàn (Trống/Có khách), cho phép chọn bàn để gọi món.
*   **Hình ảnh minh họa**:
    > *[Chèn ảnh danh sách bàn tại đây - Gợi ý: Chụp giao diện lưới các bàn ăn]*

### 5.4. Gọi Món & Đơn Hàng (Order & Menu)
*   **Chức năng**: Giao diện chọn món ăn, thêm vào giỏ hàng và tạo đơn hàng cho bàn.
*   **Hình ảnh minh họa**:
    > *[Chèn ảnh giao diện gọi món tại đây]*

### 5.5. Quản Lý Bếp (Kitchen View)
*   **Chức năng**: Hiển thị danh sách các món cần chế biến cho bộ phận bếp, cập nhật trạng thái món ăn.
*   **Hình ảnh minh họa**:
    > *[Chèn ảnh màn hình Bếp tại đây]*

### 5.6. Báo Cáo & Thống Kê (Reports)
*   **Chức năng**: Các biểu đồ thống kê doanh thu đa dạng (theo ngày, tháng, món ăn bán chạy).
*   **Hình ảnh minh họa**:
    > *[Chèn ảnh các biểu đồ báo cáo tại đây]*
