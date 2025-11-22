# 💳 Hướng dẫn Tích hợp Thanh toán VNPay

Hệ thống đã được tích hợp sẵn module thanh toán VNPay (Môi trường Sandbox).

---

## 1. Cấu hình

Thông tin cấu hình Sandbox đã được thêm vào `appsettings.json` và `.env`.

**Tài khoản test:**
- **Ngân hàng:** NCB
- **Số thẻ:** 9704198526191432198
- **Tên chủ thẻ:** NGUYEN VAN A
- **Ngày phát hành:** 07/15
- **Mật khẩu OTP:** 123456

---

## 2. Cách sử dụng trong Code

### Cách 1: Sử dụng Component `VnPayButton` (Khuyên dùng)

Chỉ cần import và sử dụng component `VnPayButton` vào bất kỳ đâu bạn muốn hiển thị nút thanh toán (ví dụ: `OrderDetail.tsx` hoặc `OrderList.tsx`).

```tsx
import VnPayButton from '../Payment/VnPayButton';

// ... trong component của bạn
<VnPayButton 
  amount={totalAmount} 
  orderDescription={`Thanh toan don hang #${orderId}`} 
/>
```

### Cách 2: Gọi API trực tiếp

```ts
import { createPaymentUrl } from '../../services/paymentService';

const handlePayment = async () => {
  try {
    const result = await createPaymentUrl(50000, "Thanh toan test");
    window.location.href = result.url; // Chuyển hướng sang VNPay
  } catch (error) {
    console.error(error);
  }
};
```

---

## 3. Quy trình thanh toán

1.  Người dùng nhấn nút **Thanh toán VNPay**.
2.  Hệ thống gọi API Backend để tạo URL thanh toán (có chữ ký bảo mật).
3.  Trình duyệt chuyển hướng sang cổng thanh toán VNPay Sandbox.
4.  Người dùng nhập thông tin thẻ test (NCB).
5.  Sau khi thanh toán thành công, VNPay chuyển hướng về:
    `http://localhost:3000/payment-result?vnp_Amount=...&vnp_ResponseCode=00...`
6.  Trang `PaymentResult` gọi API Backend để xác thực chữ ký (checksum) và hiển thị kết quả.

---

## 4. Lưu ý quan trọng

- **Môi trường:** Hiện tại đang chạy trên Sandbox (Test). Khi lên Production cần đổi thông tin trong `appsettings.json`.
- **IP Address:** VNPay yêu cầu IP Address của client. Trên localhost có thể là `127.0.0.1` hoặc `::1`.
- **Số tiền:** VNPay yêu cầu số tiền phải nhân 100 (đã xử lý trong Backend). Ví dụ 10,000 VND sẽ gửi đi là 1,000,000.

---

## 5. Kiểm thử

1.  Chạy Backend và Frontend.
2.  Đăng nhập vào hệ thống.
3.  Thêm nút `<VnPayButton amount={100000} orderDescription="Test Pay" />` vào một trang bất kỳ để test.
4.  Nhấn nút và thực hiện quy trình thanh toán với thẻ test NCB.
5.  Kiểm tra xem có quay về trang kết quả thành công không.
