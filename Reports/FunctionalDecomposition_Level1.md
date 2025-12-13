# Sơ đồ Phân rã Chức năng - Mức 1 (Level 1)
**Phân rã theo Phân hệ & Mô-đun (Subsystems & Modules)**

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
