# Sơ đồ Phân rã Chức năng - Mức 3 (Level 3)
**Chi tiết Quy trình Xử lý (Process Logic & Data Flows)**

Ở mức này, chúng ta đi sâu vào logic xử lý của các chức năng nghiệp vụ quan trọng nhất. Đây là mức chi tiết quy trình (Process Level) cho các chức năng đã xác định ở Mức 2.

### 3.1. Chi tiết Chức năng: Xử lý Đơn hàng (Order Processing Flow)

Mô tả quy trình từ khi nhân viên chọn món đến khi đơn hàng được gửi xuống bếp.

```mermaid
graph TD
    classDef step fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:1px,fontSize:11px;
    classDef api fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;
    classDef endnode fill:#ffcdd2,stroke:#c62828,stroke-width:1px;

    Start((Bắt đầu)) --> SelectTable[Chọn Bàn]:::step
    SelectTable --> CheckStatus{Bàn trống?}:::decision
    
    CheckStatus -- Có --> OpenMenu[Mở Thực đơn]:::step
    CheckStatus -- Không --> LoadOrder[Tải Đơn hàng hiện tại]:::step
    
    OpenMenu --> SelectItems[Chọn Món ăn]:::step
    SelectItems --> AddAttributes[Chọn Size/Topping/Ghi chú]:::step
    AddAttributes --> UpdateCart[Cập nhật Giỏ hàng]:::step
    
    UpdateCart --> ReviewCart{Xác nhận?}:::decision
    ReviewCart -- Sửa --> SelectItems
    ReviewCart -- OK --> SendOrder[Gửi Yêu cầu Đặt món]:::step
    
    SendOrder --> API_CreateOrder[API: POST /api/orders]:::api
    API_CreateOrder --> API_Validate{Kiểm tra Tồn kho/Hợp lệ}:::decision
    
    API_Validate -- Lỗi --> ShowError[Hiển thị Lỗi]:::endnode
    API_Validate -- OK --> DB_Save[Lưu Đơn hàng vào DB]:::api
    DB_Save --> DB_UpdateTable[Cập nhật Trạng thái Bàn]:::api
    
    DB_UpdateTable --> SignalR[Gửi SignalR: Báo Bếp/Thu ngân]:::api
    SignalR --> PrintKitchen[In Phiếu Bếp]:::step
    PrintKitchen --> End((Hoàn tất)):::endnode
```

### 3.2. Chi tiết Chức năng: Quy trình Thanh toán & VietQR (Payment Flow)

Mô tả quy trình tính tiền và thanh toán qua QR Code.

```mermaid
graph TD
    classDef step fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:1px,fontSize:11px;
    classDef api fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;
    classDef endnode fill:#ffcdd2,stroke:#c62828,stroke-width:1px;

    Start((Bắt đầu)) --> SelectOrder[Chọn Đơn hàng cần thanh toán]:::step
    SelectOrder --> CalcTotal[Tính Tổng tiền & Thuế]:::step
    
    CalcTotal --> SelectMethod{Phương thức?}:::decision
    
    %% Tiền mặt
    SelectMethod -- Tiền mặt --> InputCash[Nhập số tiền khách đưa]:::step
    InputCash --> CalcChange[Tính tiền thừa]:::step
    CalcChange --> ConfirmPay[Xác nhận Thanh toán]:::step
    
    %% VietQR
    SelectMethod -- Chuyển khoản --> GenQR[Tạo Mã QR Động]:::step
    GenQR --> API_QR[API: Generate VietQR]:::api
    API_QR --> ShowQR[Hiển thị QR trên Màn hình]:::step
    ShowQR --> CheckPay{Đã nhận tiền?}:::decision
    CheckPay -- Chưa --> Wait[Chờ xác nhận]:::step
    Wait --> CheckPay
    CheckPay -- Rồi --> ConfirmPay
    
    %% Kết thúc
    ConfirmPay --> API_Pay[API: PUT /api/orders/pay]:::api
    API_Pay --> UpdateStat[Cập nhật: Bàn Trống]:::api
    UpdateStat --> PrintBill[In Hóa đơn]:::step
    PrintBill --> End((Hoàn tất)):::endnode
```

### 3.3. Chi tiết Chức năng: Quản trị Sản phẩm (Product Management Flow)

Chi tiết quy trình Thêm/Sửa sản phẩm bao gồm cả xử lý hình ảnh.

```mermaid
graph TD
    classDef step fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:1px,fontSize:11px;
    classDef api fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;
    classDef endnode fill:#ffcdd2,stroke:#c62828,stroke-width:1px;

    Start((Admin)) --> ViewList[Xem Danh sách Sản phẩm]:::step
    ViewList --> Action{Hành động?}:::decision
    
    %% Xem/Tìm kiếm
    Action -- Tìm kiếm --> Filter[Nhập từ khóa]:::step
    Filter --> API_Get[API: GET /api/products]:::api
    API_Get --> Display[Hiển thị lại List]:::step
    
    %% Thêm mới / Sửa
    Action -- Thêm/Sửa --> InputInfo[Nhập thông tin: Tên, Giá, Loại]:::step
    InputInfo --> HasImage{Có ảnh không?}:::decision
    
    HasImage -- Có --> UploadImg[Chọn file ảnh]:::step
    UploadImg --> API_Upload[API: POST /api/upload]:::api
    API_Upload --> SaveUrl[Nhận URL ảnh trả về]:::step
    SaveUrl --> SubmitForm[Gửi Form dữ liệu]:::step
    
    HasImage -- Không --> SubmitForm
    
    %% Submit
    SubmitForm --> API_Save[API: POST/PUT /api/products]:::api
    API_Save --> Validate{Validate?}:::decision
    
    Validate -- Fail --> ShowErr[Báo lỗi Input]:::endnode
    Validate -- OK --> DBSave[Lưu xuống DB]:::api
    DBSave --> Success[Thông báo Thành công]:::step
    Success --> End((Kết thúc)):::endnode
```
