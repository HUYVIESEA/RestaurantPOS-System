# 📝 Hướng dẫn Đăng ký & Cấu hình VNPAY Sandbox

Tài liệu này hướng dẫn bạn cách đăng ký tài khoản thử nghiệm (Sandbox) của VNPAY để lấy `TmnCode` và `HashSecret` riêng cho dự án.

---

## 🚀 Bước 1: Đăng ký tài khoản

1.  Truy cập trang đăng ký dành cho Developer của VNPAY:
    👉 **[https://sandbox.vnpayment.vn/devreg/](https://sandbox.vnpayment.vn/devreg/)**

2.  Điền thông tin đăng ký:
    *   **Họ và tên:** Tên của bạn.
    *   **Email:** Email thực (để nhận thông tin cấu hình).
    *   **Số điện thoại:** SĐT của bạn.
    *   **Tên doanh nghiệp:** (Có thể điền tên dự án: "Restaurant POS").
    *   **Website:** Điền `http://restaurant-pos-demo.com` (Lưu ý: Nếu hệ thống không chấp nhận `localhost`, hãy điền một tên miền giả bất kỳ có đuôi .com).

3.  Nhấn **Đăng ký**.

---

## 📧 Bước 2: Nhận thông tin qua Email

Sau khi đăng ký, VNPAY sẽ gửi một email tự động chứa thông tin tích hợp. Hãy tìm các thông tin sau:

1.  **vnp_TmnCode** (Mã Website/Terminal ID): Ví dụ `CGXZLS0Z`
2.  **vnp_HashSecret** (Chuỗi bí mật tạo checksum): Ví dụ `XNBCJFAK...`
3.  **Link trang quản trị (Merchant Admin):** Để xem lịch sử giao dịch test.

---

## ⚙️ Bước 3: Cập nhật vào Dự án

Mở file `RestaurantPOS.API/appsettings.json` và thay thế thông tin cũ bằng thông tin bạn vừa nhận được:

```json
  "Vnpay": {
    "TmnCode": "MÃ_TMN_CODE_CỦA_BẠN",      <-- Thay vào đây
    "HashSecret": "HASH_SECRET_CỦA_BẠN",   <-- Thay vào đây
    "BaseUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "Command": "pay",
    "CurrCode": "VND",
    "Version": "2.1.0",
    "Locale": "vn",
    "ReturnUrl": "http://localhost:3000/payment-result"
  },
```

> ⚠️ **Lưu ý:** Sau khi sửa `appsettings.json`, bạn cần **Restart lại Backend** để áp dụng thay đổi.

---

## 💳 Bước 4: Thông tin Thẻ Test

Khi thanh toán trên môi trường Sandbox, bạn **BẮT BUỘC** phải dùng thông tin thẻ test sau đây (không dùng thẻ thật):

### 1. Ngân hàng NCB (Khuyên dùng)
*   **Ngân hàng:** `NCB`
*   **Số thẻ:** `9704198526191432198`
*   **Tên chủ thẻ:** `NGUYEN VAN A`
*   **Ngày phát hành:** `07/15`
*   **Mật khẩu OTP:** `123456`

### 2. Các kịch bản test
*   **Thành công:** Nhập đúng thông tin trên.
*   **Thất bại (Sai OTP):** Nhập OTP khác `123456`.
*   **Thất bại (Hủy):** Nhấn nút "Hủy" tại trang thanh toán.
*   **Thất bại (Số dư không đủ):** (Cần cấu hình nâng cao trong trang quản trị Sandbox).

---

## 🔧 Bước 5: Cấu hình IPN (Nâng cao - Optional)

Hiện tại hệ thống đang dùng `ReturnUrl` (trình duyệt quay về) để xác nhận thanh toán. Cách này nhanh nhưng chưa bảo mật tuyệt đối (nếu user tắt trình duyệt ngay lúc đó).

Để chuyên nghiệp hơn, bạn cần cấu hình **IPN (Instant Payment Notification)** - VNPAY gọi ngầm về Server của bạn.

**Vấn đề:** VNPAY không thể gọi `localhost`.
**Giải pháp:** Dùng **Ngrok** để public localhost ra internet.

1.  Tải và cài đặt [Ngrok](https://ngrok.com/).
2.  Chạy lệnh: `ngrok http 5000` (Port của Backend).
3.  Copy đường dẫn HTTPS ngrok tạo ra (ví dụ: `https://a1b2.ngrok.io`).
4.  Vào trang quản trị VNPAY Sandbox > Cấu hình IPN.
5.  Đặt URL IPN là: `https://a1b2.ngrok.io/api/Payment/ipn` (Bạn cần viết thêm API này trong Controller).

*(Hiện tại dự án chưa cần bước này, ReturnUrl là đủ cho giai đoạn phát triển).*
