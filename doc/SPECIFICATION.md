# Đặc Tả Yêu Cầu & Use Case Chi Tiết
**Dự án:** Restaurant POS System  
**Phiên bản:** 2.1 – **Ngày cập nhật:** 11/12/2025

---

## 1. Yêu Cầu Phi Chức Năng (Non-functional Requirements)

### 1.1. Hiệu Năng (Performance)
*   **Thời gian phản hồi API:** Các thao tác chính (Login, Lấy danh sách bàn, Gọi món) phải phản hồi dưới **500ms** trong điều kiện mạng LAN ổn định.
*   **Đồng bộ thời gian thực:** Độ trễ từ khi Bếp nhận đơn đến khi Máy thu ngân cập nhật trạng thái không quá **1 giây** (sử dụng SignalR).
*   **Cơ sở dữ liệu:** Hệ thống đã được tối ưu Index (Chỉ mục) cho các bảng `Orders`, `OrderItems`, `Payments` để đảm bảo truy vấn báo cáo doanh thu nhanh chóng ngay cả khi dữ liệu lên tới 1 triệu bản ghi.

### 1.2. Bảo Mật (Security)
*   **Xác thực:** Sử dụng cơ chế **JWT (JSON Web Token)**. Mỗi request API đều yêu cầu Token hợp lệ trong Header.
*   **Mật khẩu:** Mật khẩu người dùng được mã hóa một chiều bằng thuật toán **BCrypt** trước khi lưu vào Database. Không lưu mật khẩu dạng văn bản thuần (plain-text).
*   **Phân quyền:**
    *   **Admin:** Toàn quyền hệ thống (Cấu hình, Báo cáo, Quản lý nhân viên).
    *   **Staff:** Giới hạn chỉ được bán hàng, gọi món và thanh toán.

### 1.3. Độ Tin Cậy (Reliability & Availability)
*   **Cơ chế Reconnect:** Ứng dụng Desktop có khả năng tự động kết nối lại (Auto-reconnect) với SignalR Server nếu mạng bị gián đoạn.
*   **Data Integrity:** Sử dụng Transaction (Giao dịch) trong Database để đảm bảo tính toàn vẹn dữ liệu. Ví dụ: Khi thanh toán, việc "Cập nhật trạng thái đơn" và "Lưu lịch sử thanh toán" phải cùng thành công hoặc cùng thất bại.

---

## 2. Đặc Tả Use Case Chi Tiết

Dưới đây là đặc tả chi tiết cho 3 chức năng cốt lõi nhất của hệ thống.

### UC-01: Đăng Nhập Hệ Thống

| Mục | Nội Dung |
| :--- | :--- |
| **Tên Use Case** | Đăng nhập (Login) |
| **Tác nhân (Actor)** | Nhân viên (Staff), Quản lý (Admin) |
| **Mô tả** | Người dùng đăng nhập vào ứng dụng Desktop để bắt đầu ca làm việc. |
| **Tiền điều kiện** | Ứng dụng đã được cài đặt và kết nối tới Server API. |
| **Luồng chính (Main Flow)** | 1. Người dùng mở ứng dụng.<br>2. Hệ thống hiển thị form đăng nhập.<br>3. Người dùng nhập `Username` và `Password`.<br>4. Người dùng nhấn nút "Đăng nhập".<br>5. Hệ thống gửi yêu cầu xác thực lên API.<br>6. API kiểm tra thông tin hợp lệ, trả về Token.<br>7. Hệ thống chuyển hướng vào màn hình chính (Sơ đồ bàn). |
| **Luồng phụ (Alt Flow)** | **3a. Sai thông tin:** Nếu nhập sai Mật khẩu/Tên đăng nhập -> Hệ thống hiển thị thông báo lỗi màu đỏ "Sai thông tin đăng nhập".<br>**5a. Mất kết nối:** Nếu không kết nối được Server -> Hiển thị thông báo "Lỗi kết nối Server". |

---

### UC-02: Gọi Món (Order)

| Mục | Nội Dung |
| :--- | :--- |
| **Tên Use Case** | Gọi món (Create Order) |
| **Tác nhân (Actor)** | Nhân viên Thu ngân (Staff) |
| **Mô tả** | Nhân viên chọn bàn và thêm các món ăn khách yêu cầu vào hệ thống. |
| **Tiền điều kiện** | Nhân viên đã đăng nhập. Bàn đang ở trạng thái Trống hoặc Đang phục vụ. |
| **Luồng chính (Main Flow)** | 1. Nhân viên chọn một bàn trên sơ đồ.<br>2. Hệ thống hiển thị danh sách thực đơn (Menu).<br>3. Nhân viên chọn món ăn và số lượng (Ví dụ: 2 Bia, 1 Lẩu).<br>4. Nhân viên thêm ghi chú nếu cần (Ví dụ: "Không hành").<br>5. Nhân viên nhấn nút "Gửi Bếp".<br>6. Hệ thống lưu đơn hàng và chuyển trạng thái bàn sang "Có khách" (Màu đỏ).<br>7. Hệ thống gửi thông báo Real-time đến các máy khác. |
| **Luồng phụ (Alt Flow)** | **6a. Hết món:** Nếu món ăn vừa bị khóa/hết hàng -> Hệ thống báo lỗi và yêu cầu chọn món khác.<br>**7a. Lỗi mạng:** Nếu mất kết nối khi gửi đơn -> Hệ thống báo "Gửi đơn thất bại" và giữ nguyên giỏ hàng để thử lại. |

---

### UC-03: Thanh Toán QR Code

| Mục | Nội Dung |
| :--- | :--- |
| **Tên Use Case** | Thanh toán qua QR Ngân hàng (VietQR) |
| **Tác nhân (Actor)** | Nhân viên Thu ngân |
| **Mô tả** | Tính tiền cho khách và tạo mã QR để khách chuyển khoản nhanh. |
| **Tiền điều kiện** | Đơn hàng chưa thanh toán. Cấu hình ngân hàng đã được thiết lập bởi Admin. |
| **Luồng chính (Main Flow)** | 1. Nhân viên chọn bàn cần thanh toán -> Nhấn "Thanh toán".<br>2. Chọn phương thức "Chuyển khoản / QR Code".<br>3. Hệ thống tự động lấy thông tin Ngân hàng + Số tiền + Nội dung chuyển khoản.<br>4. Hệ thống gọi API VietQR để tạo mã QR.<br>5. Hiển thị mã QR lên màn hình.<br>6. Khách hàng quét mã và thanh toán.<br>7. Nhân viên xác nhận "Đã nhận tiền".<br>8. Hệ thống in hóa đơn, đóng đơn hàng và giải phóng bàn (về màu Xanh). |
| **Hậu điều kiện** | Doanh thu được ghi nhận vào báo cáo ngày. Bàn trở về trạng thái Trống. |

---

## 3. Công Nghệ Sử Dụng (Tech Stack)

*   **Frontend (Desktop):** WPF (.NET 9.0), Material Design XAML, LiveCharts (Biểu đồ).
*   **Backend:** ASP.NET Core 8.0 Web API.
*   **Database:** PostgreSQL (Lưu trữ dữ liệu lớn, ổn định, mã nguồn mở).
*   **Real-time:** SignalR (Đồng bộ trạng thái bàn tức thì).
*   **ORM:** Entity Framework Core (Code-First Migration).
*   **Testing:** NUnit, FlaUI (Kiểm thử giao diện tự động).
