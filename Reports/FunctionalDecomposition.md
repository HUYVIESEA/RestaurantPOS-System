# Phân tích Chức năng Hệ thống RestaurantPOS

Tài liệu này mô tả sự phân rã chức năng của hệ thống ở các mức chi tiết khác nhau (Mức 1 và Mức 2), tập trung vào ứng dụng Desktop và Backend API.

## Mức 1: Phân rã theo Phân hệ & Mô-đun (Subsystems & Modules)

Ở mức này, hệ thống được chia thành các khối chức năng lớn (Modules) dựa trên trách nhiệm nghiệp vụ chính.

```mermaid
graph TD
    %% -- DEFINE STYLES --
    classDef main fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef sub fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef desktop fill:#e0f7fa,stroke:#006064,stroke-width:2px;
    classDef api fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;

    System[RestaurantPOS System]:::main --> Desktop[Desktop App]:::desktop
    System --> API[Backend API]:::api

    %% -- DESKTOP LEVEL 1 --
    Desktop --> D_POS[Module Bán Hàng (POS)]:::sub
    Desktop --> D_Catalog[Module Quản lý Thực Đơn]:::sub
    Desktop --> D_Report[Module Báo Cáo & Thống kê]:::sub
    Desktop --> D_System[Module Quản trị Hệ thống]:::sub

    %% -- API LEVEL 1 --
    API --> A_Auth[Service Xác thực & Phân quyền]:::sub
    API --> A_Business[Service Nghiệp vụ Chính]:::sub
    API --> A_Infra[Service Hạ tầng & Tích hợp]:::sub
```

## Mức 2: Phân rã Chức năng Chi tiết (Detailed Functions)

Ở mức này, các mô-đun từ Mức 1 được phân rã thành các chức năng cụ thể mà người dùng hoặc hệ thống thực hiện.

### 2.1. Phân rã Ứng dụng Desktop

```mermaid
graph LR
    %% -- STYLES --
    classDef module fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef func fill:#ffffff,stroke:#333,stroke-width:1px;

    %% -- POS MODULE --
    POS[Module Bán Hàng]:::module
    POS --> P1(Quản lý Bàn ăn):::func
    POS --> P2(Ghi nhận Đơn hàng/Order):::func
    POS --> P3(Xử lý Thanh toán):::func
    POS --> P4(Vận hành Thiết bị):::func

    P1 --- P1_1[Theo dõi trạng thái Bàn]
    P1 --- P1_2[Chuyển bàn / Gộp bàn]

    P2 --- P2_1[Chọn món & Topping]
    P2 --- P2_2[Ghi chú món ăn]
    P2 --- P2_3[Xử lý Đơn mang về - Takeaway]

    P3 --- P3_1[Tính tổng tiền & Thuế]
    P3 --- P3_2[Tạo QR VietQR động]
    P3 --- P3_3[Xác nhận thanh toán]

    P4 --- P4_1[In Hóa đơn & Báo bếp]
    P4 --- P4_2[Hiển thị Màn hình Khách hàng]

    %% -- CATALOG MODULE --
    CAT[Module Thực Đơn]:::module
    CAT --> C1(Quản lý Danh mục):::func
    CAT --> C2(Quản lý Sản phẩm):::func
    
    C1 --- C1_1[Thêm/Sửa/Xóa Nhóm món]
    C2 --- C2_1[CRUD Sản phẩm]
    C2 --- C2_2[Thiết lập Giá & Ảnh]

    %% -- SYSTEM MODULE --
    SYS[Module Quản trị]:::module
    SYS --> S1(Cấu hình Shop):::func
    SYS --> S2(Quản lý Người dùng):::func
    
    S1 --- S1_1[Thiết lập Ngân hàng/VietQR]
    S1 --- S1_2[Cấu hình Máy in]
    S2 --- S2_1[Tạo tài khoản nhân viên]

    %% -- REPORT MODULE --
    RPT[Module Báo cáo]:::module
    RPT --> R1(Dashboard):::func
    
    R1 --- R1_1[Biểu đồ Doanh thu ngày]
    R1 --- R1_2[Thống kê Món bán chạy]
```

### 2.2. Phân rã Backend API

```mermaid
graph LR
    %% -- STYLES --
    classDef service fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef endpoint fill:#ffffff,stroke:#333,stroke-width:1px;

    %% -- AUTH SERVICE --
    AUTH[Service Xác thực]:::service
    AUTH --> Au1(Authentication):::endpoint
    AUTH --> Au2(Authorization):::endpoint
    
    Au1 --- Au1_1[Đăng nhập / Login]
    Au2 --- Au2_1[Phân quyền Role-based]

    %% -- BUSINESS SERVICE --
    BIZ[Service Nghiệp vụ]:::service
    BIZ --> B1(Quản lý Đơn hàng - Orders):::endpoint
    BIZ --> B2(Quản lý Danh mục - Catalog):::endpoint
    BIZ --> B3(Quản lý Bàn - Tables):::endpoint

    B1 --- B1_1[Tạo mới Đơn hàng]
    B1 --- B1_2[Cập nhật Trạng thái Đơn]
    B1 --- B1_3[Tính toán Doanh thu]

    B2 --- B2_1[API Sản phẩm & Danh mục]
    B2 --- B2_2[Lọc & Tìm kiếm món]

    B3 --- B3_1[Cập nhật Trạng thái Bàn - SignalR]

    %% -- INFRA SERVICE --
    INFRA[Service Hạ tầng]:::service
    INFRA --> I1(Lưu trữ File):::endpoint
    INFRA --> I2(Tích hợp VietQR):::endpoint
    INFRA --> I3(Real-time Notification):::endpoint

    I1 --- I1_1[Upload Ảnh món ăn]
    I2 --- I2_1[Generate VietQR String]
    I3 --- I3_1[Push thông báo tới Bếp/Thu ngân]
```
