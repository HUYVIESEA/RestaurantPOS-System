# Sơ đồ Cơ sở Dữ liệu (ER Diagram)

Dưới đây là sơ đồ thực thể - quan hệ (Entity Relationship Diagram) được xây dựng dựa trên file cấu trúc chuẩn `doc/database_schema_standard.sql`.

```mermaid
erDiagram
    %% ==========================================
    %% 1. USER MANAGEMENT SUB-SYSTEM
    %% ==========================================
    Users {
        int Id PK
        string Username
        string Email
        string PasswordHash
        string FullName
        string PhoneNumber
        string Role "Admin, Staff, Manager"
        boolean IsActive
        timestamp CreatedAt
        timestamp LastLoginAt
        string FcmToken
    }

    UserDevices {
        int Id PK
        int UserId FK
        string DeviceToken
        string DeviceType
        timestamp LastUpdated
    }

    PasswordResetTokens {
        int Id PK
        int UserId FK
        string Token
        timestamp CreatedAt
        timestamp ExpiresAt
        boolean IsUsed
        timestamp UsedAt
    }

    Users ||--o{ UserDevices : "has"
    Users ||--o{ PasswordResetTokens : "requests"

    %% ==========================================
    %% 2. CATALOG SUB-SYSTEM
    %% ==========================================
    Categories {
        int Id PK
        string Name
        string Description
    }

    Products {
        int Id PK
        string Name
        string Description
        decimal Price
        int CategoryId FK
        string ImageUrl
        boolean IsAvailable
        timestamp CreatedAt
        timestamp UpdatedAt
    }

    Categories ||--o{ Products : "contains"

    %% ==========================================
    %% 3. OPERATION SUB-SYSTEM (Tables & Orders)
    %% ==========================================
    Tables {
        int Id PK
        string TableNumber
        int Capacity
        boolean IsAvailable
        timestamp OccupiedAt
        string Floor
        boolean IsMerged
        int MergedGroupId
        string MergedTableNumbers
    }

    Orders {
        int Id PK
        int TableId FK
        timestamp OrderDate
        decimal TotalAmount
        string Status "Pending, Completed, Cancelled"
        string CustomerName
        string Notes
        string OrderType "DineIn, TakeAway"
        int ParentOrderId
        int OrderGroupId
        string PaymentStatus
        string PaymentMethod
        decimal PaidAmount
        timestamp CompletedAt
    }

    OrderItems {
        int Id PK
        int OrderId FK
        int ProductId FK
        int Quantity
        decimal UnitPrice
        string Notes
    }

    Tables ||--o{ Orders : "places"
    Orders ||--o{ OrderItems : "includes"
    Products ||--o{ OrderItems : "is_in"

    %% Self-reference for split/merged orders (implied by ParentOrderId)
    Orders |o--o{ Orders : "parent_of"

    %% ==========================================
    %% 4. FINANCIAL SUB-SYSTEM
    %% ==========================================
    Payments {
        int Id PK
        int OrderId FK
        decimal Amount
        string Method
        string TransactionId
        string Note
        timestamp PaymentDate
        string Status
    }

    PaymentSettings {
        int Id PK
        string BankName
        string BankBin
        string AccountNumber
        string AccountName
        boolean IsActive
        timestamp CreatedAt
        timestamp UpdatedAt
        int UpdatedByUserId
    }

    Orders ||--o{ Payments : "paid_via"

```

## Giải thích các Thực thể

### 1. Quản lý Người dùng (Authorization)
*   **Users**: Bảng trung tâm lưu trữ thông tin nhân viên, quản trị viên.
*   **UserDevices**: Lưu token thiết bị để gửi thông báo (Push Notification).
*   **PasswordResetTokens**: Quản lý quy trình quên mật khẩu.

### 2. Danh mục & Sản phẩm (Catalog)
*   **Categories**: Danh mục món ăn (Đồ ăn, Đồ uống, Khai vị...).
*   **Products**: Chi tiết món ăn, giá bán và hình ảnh.

### 3. Vận hành (Operations)
*   **Tables**: Quản lý bàn ăn, trạng thái (Trống/Có khách) và gộp bàn.
*   **Orders**: Đơn hàng, lưu trữ thông tin tổng quan, trạng thái thanh toán và loại đơn (Tại bàn/Mang về).
*   **OrderItems**: Chi tiết từng món trong đơn hàng.

### 4. Tài chính (Financial)
*   **Payments**: Lịch sử giao dịch thanh toán cho từng đơn hàng.
*   **PaymentSettings**: Cấu hình tài khoản ngân hàng để nhận tiền qua QR Code (VietQR).
