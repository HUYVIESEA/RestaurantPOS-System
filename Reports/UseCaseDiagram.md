# Sơ đồ Use Case (Biểu đồ Ca sử dụng)

Tài liệu này mô tả các tác nhân (Actors) và các chức năng (Use Cases) mà họ tương tác trong hệ thống RestaurantPOS.

```mermaid
usecaseDiagram
    %% ==========================================
    %% ACTORS
    %% ==========================================
    actor Staff as "Nhân viên Thu ngân"
    actor Manager as "Quản lý / Admin"

    package "Hệ thống RestaurantPOS" {
        
        %% --- COMMON USE CASES ---
        usecase "Đăng nhập hệ thống" as UC_Login
        usecase "Đổi mật khẩu" as UC_ChangePass

        %% --- POS OPERATIONS (STAFF) ---
        usecase "Quản lý Bàn" as UC_ManageTable
        usecase "Gọi món / Order" as UC_Order
        usecase "Xử lý Đơn Mang về" as UC_Takeaway
        usecase "Thanh toán & Tính tiền" as UC_Payment
        usecase "In Hóa đơn & Báo Bếp" as UC_Print
        usecase "Gộp / Chuyển bàn" as UC_MergeTable

        %% --- MANAGEMENT (MANAGER) ---
        usecase "Quản lý Thực đơn" as UC_ManageMenu
        usecase "Quản lý Người dùng" as UC_ManageUsers
        usecase "Xem Báo cáo & Dashboard" as UC_Reports
        usecase "Cấu hình Hệ thống" as UC_Config
        usecase "Quản lý Bàn & Khu vực" as UC_ConfigTable

    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================

    %% General Inheritance
    Staff <|-- Manager

    %% Staff Relations
    Staff --> UC_Login
    Staff --> UC_ChangePass
    Staff --> UC_ManageTable
    Staff --> UC_Order
    Staff --> UC_Takeaway
    Staff --> UC_Payment
    Staff --> UC_Print
    Staff --> UC_MergeTable

    %% Manager Relations
    Manager --> UC_Login
    Manager --> UC_ChangePass
    Manager --> UC_ManageMenu
    Manager --> UC_ManageUsers
    Manager --> UC_Reports
    Manager --> UC_Config
    Manager --> UC_ConfigTable

    %% Includes / Extends
    UC_Order ..> UC_Print : include
    UC_Payment ..> UC_Print : include
```

## Mô tả Chi tiết Tác nhân

### 1. Nhân viên Thu ngân / Phục vụ (Staff)
Người trực tiếp vận hành hệ thống tại cửa hàng.
*   **Trách nhiệm chính:**
    *   Tiếp nhận yêu cầu từ khách hàng.
    *   Tạo đơn hàng (tại bàn hoặc mang về).
    *   Thực hiện thanh toán và in hóa đơn.
    *   Theo dõi trạng thái phục vụ của các bàn.

### 2. Quản lý / Admin (Manager)
Người chịu trách nhiệm vận hành chung và cấu hình hệ thống.
*   **Trách nhiệm chính:**
    *   Quản lý danh mục món ăn, giá cả.
    *   Quản lý nhân sự và tài khoản truy cập.
    *   Xem báo cáo doanh thu để ra quyết định kinh doanh.
    *   Thiết lập các cấu hình kỹ thuật (Ngân hàng, Máy in).
