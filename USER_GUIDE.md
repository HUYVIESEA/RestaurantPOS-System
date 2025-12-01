# 📖 Hướng dẫn sử dụng SmartOrder POS

Chào mừng bạn đến với SmartOrder POS! Tài liệu này sẽ hướng dẫn bạn cách sử dụng các tính năng chính của ứng dụng.

## 1. Đăng nhập
- Mở ứng dụng.
- Nhập **Tên đăng nhập** và **Mật khẩu** của bạn.
- Nhấn nút **LOGIN**.
- *Lưu ý: Nếu không kết nối được máy chủ, hãy vào Cài đặt (biểu tượng bánh răng ở màn hình đăng nhập nếu có, hoặc liên hệ quản trị viên) để cấu hình địa chỉ IP.*

## 2. Màn hình chính (Home)
Sau khi đăng nhập, bạn sẽ thấy màn hình chính với các chức năng:
- **Quản lý Bàn**: Xem sơ đồ bàn, trạng thái bàn.
- **Lịch sử Đơn hàng**: Xem lại các đơn hàng cũ.
- **Thực đơn**: Tra cứu món ăn.
- **Cài đặt**: Cấu hình ứng dụng.
- **Đăng xuất**: Thoát tài khoản.

## 3. Quy trình Phục vụ (Order)

### Bước 1: Chọn Bàn
- Vào mục **Quản lý Bàn**.
- Chọn một bàn **Trống** (màu xanh) để bắt đầu gọi món.
- Nếu bàn đang có khách (màu cam/đỏ), nhấn vào để xem đơn hàng hiện tại hoặc thanh toán.

### Bước 2: Gọi Món
- Tại màn hình gọi món, bạn có thể tìm kiếm món ăn theo tên hoặc chọn theo danh mục.
- Nhấn vào món ăn để thêm vào giỏ hàng.
- **Thêm ghi chú**: Nhấn vào số lượng món trong danh sách hoặc trong giỏ hàng để chỉnh sửa số lượng và thêm ghi chú (ví dụ: "Ít đường", "Không cay").

### Bước 3: Xác nhận Đơn hàng
- Nhấn vào thanh **Giỏ hàng** ở dưới cùng để xem lại.
- Kiểm tra số lượng, món ăn và tổng tiền.
- Nhấn **Đặt món** để gửi đơn xuống bếp.

## 4. Thanh toán
- Chọn bàn cần thanh toán.
- Màn hình sẽ hiển thị chi tiết đơn hàng và tổng tiền.
- Nhấn **Thanh toán**.
- Nhập số tiền khách đưa.
- Ứng dụng sẽ tính tiền thừa.
- Nhấn **Hoàn tất** để đóng bàn.

## 5. Ghép/Tách Bàn
- **Ghép bàn**: Tại màn hình Quản lý Bàn, nhấn giữ một bàn trống, sau đó chọn thêm các bàn khác cần ghép. Nhấn nút **Ghép bàn** ở góc trên phải.
- **Tách bàn**: Nhấn giữ bàn đã ghép, chọn **Tách bàn** từ menu.

## 6. Màn hình Bếp (Kitchen Display)
- Dành cho bộ phận bếp.
- Hiển thị danh sách các món cần chế biến.
- Nhấn vào món để đổi trạng thái: **Đang chuẩn bị** -> **Sẵn sàng**.
- Khi món Sẵn sàng, nhân viên phục vụ sẽ nhận được thông báo (nếu đã cấu hình).

## 7. Cài đặt
- **Cấu hình máy chủ**: Thay đổi địa chỉ API của backend (ví dụ: `http://192.168.1.10:5000`).
- **Máy in**: Cấu hình máy in hóa đơn (Tính năng đang phát triển).

## 8. Xử lý sự cố thường gặp
- **Không kết nối được máy chủ**: Kiểm tra Wifi và địa chỉ IP máy chủ trong Cài đặt.
- **Không nhận được thông báo**: Đảm bảo ứng dụng được cấp quyền thông báo.
- **Lỗi đồng bộ**: Nếu mất mạng, đơn hàng sẽ được lưu tạm thời và tự động gửi khi có mạng lại.

---
*SmartOrder POS v1.0*
