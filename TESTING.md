# Hướng Dẫn Kiểm Thử Hệ Thống Restaurant POS

Tài liệu này cung cấp danh sách các trường hợp kiểm thử (Test Cases) thủ công dành cho hệ thống Restaurant POS. Người kiểm thử vui lòng thực hiện tuần tự và đánh dấu vào các mục đã đạt.

## 1. Kiểm Thử Hệ Thống (Desktop & Manager)

### A. Quản Lý Dịch Vụ (Manager App)
- [ ] **Khởi động:** Mở ứng dụng `RestaurantPOS.Manager`.
- [ ] **Trạng thái ban đầu:** Các đèn trạng thái (API, Web) màu Đỏ hoặc Vàng.
- [ ] **Start All:** Bấm nút "Start All".
- [ ] **Kiểm tra Port:** Đảm bảo API chạy Port 5000, Web chạy Port 5173. Đèn chuyển Xanh.
- [ ] **Dừng:** Bấm "Stop All", đèn chuyển Đỏ.

### B. Desktop App (POS)
- [ ] **Login:** Mở Desktop App -> Đăng nhập bằng tài khoản Staff/Admin.
- [ ] **Giao diện Bàn:**
    - [ ] Hiển thị danh sách bàn đúng theo tầng.
    - [ ] Bàn trống (Màu Xanh), Bàn có khách (Màu Cam/Đỏ).
- [ ] **Đặt món:**
    - [ ] Chọn bàn -> Chọn món -> Thêm Note -> Bấm "Đặt Ngay".
    - [ ] Kiểm tra bàn chuyển sang trạng thái "Có khách".
- [ ] **Thanh toán:**
    - [ ] Chọn bàn đang ăn -> Bấm "Thanh toán".
    - [ ] Nhập số tiền khách đưa -> Bấm "Hoàn tất".
    - [ ] Bàn phải trở về trạng thái "Trống".
- [ ] **Cảnh báo mất kết nối:** (Test Case quan trọng) 
    - [ ] Tắt Manager (Stop API).
    - [ ] Thao tác trên Desktop App -> Phải hiện thông báo lỗi kết nối rõ ràng, không crash.

## 2. Kiểm Thử Giao Diện Web (React Client)

### A. Truy cập & Đăng nhập
- [ ] Truy cập `http://localhost:5173`.
- [ ] Đăng nhập với tài khoản Admin.

### B. Dashboard & Báo cáo
- [ ] **Dashboard:** Kiểm tra biểu đồ doanh thu, số đơn hàng trong ngày.
- [ ] **Menu Management:**
    - [ ] Thêm món mới.
    - [ ] Sửa giá món.
    - [ ] Xóa món (hoặc ẩn).
    - [ ] Kiểm tra món vùa thêm có hiện bên Desktop App không.

## 3. Kiểm Thử Android App (Nếu có)

- [ ] **Kết nối:** Chạy trên máy ảo/điện thoại chung mạng LAN.
- [ ] **Login:** Đăng nhập thành công.
- [ ] **Đồng bộ:** Order trên điện thoại -> Desktop App phải nhảy thông báo (nếu có SignalR) hoặc hiển thị bàn có khách.

## 4. Kiểm Thử Dữ Liệu & Logic (Backend)
Phần này đã được bao phủ bởi Unit Tests tự động, nhưng có thể kiểm tra thêm:
- [ ] **Database:** Mở SQL Server Management Studio.
- [ ] Kiểm tra bảng `Orders`: Đơn hàng mới có được insert không.
- [ ] Kiểm tra bảng `Payments`: Lịch sử thanh toán có lưu đúng số tiền không.

---
**Lưu ý:** Nếu gặp lỗi ở bất kỳ bước nào, vui lòng chụp màn hình và ghi lại file log.
