# **Lộ Trình Chuyển Đổi Hệ Thống POS Sang Big Data (Self-Hosted)**

**Dự án:** POS System Upgrade **Mục tiêu:** Xây dựng hạ tầng xử lý dữ liệu lớn (20 triệu+ bản ghi), tối ưu chi phí (0đ bản quyền), sử dụng phần cứng có sẵn. **Stack kỹ thuật:** C\# (.NET), MongoDB, Docker.

## **1\. Kiến Trúc Kỹ Thuật (Architecture)**

Chúng ta chuyển từ mô hình SQL truyền thống (RDBMS) sang mô hình NoSQL Document để tối ưu cho khả năng đọc/ghi tốc độ cao và mở rộng dễ dàng.

### **1.1. So sánh mô hình**

| Thành phần | Hệ thống cũ (SQL/Firebase) | Hệ thống mới (Big Data Optimized) |
| :---- | :---- | :---- |
| **Cơ sở dữ liệu** | SQL Server / PostgreSQL / Firebase | **MongoDB Community (Self-hosted)** |
| **Mô hình dữ liệu** | Quan hệ (Joins nhiều bảng) | **Document (Nhúng dữ liệu con vào cha)** |
| **Hạ tầng** | Cài trực tiếp trên OS / Cloud trả phí | **Docker Container (Cách ly, Linh hoạt)** |
| **Chi phí** | Tốn kém khi Scale | **Miễn phí (Tận dụng Laptop cũ)** |

### **1.2. Sơ đồ triển khai (Local Environment)**

`graph LR`  
    `User[Developer] -->|C# Code| Docker[Docker Desktop]`  
    `subgraph "Laptop Server (Docker Host)"`  
        `Docker --> Mongo[MongoDB Container :27017]`  
        `Docker --> MongoUI[Mongo Express UI :8081]`  
        `Mongo --> Disk[Local HDD/SSD]`  
    `end`

## **2\. Thiết Lập Môi Trường (Infrastructure Setup)**

Sử dụng Docker để tạo Server MongoDB ảo hóa ngay trên máy cá nhân mà không làm "rác" hệ điều hành.

### **File: docker-compose.yml**

Lưu file này vào thư mục dự án và chạy lệnh docker-compose up \-d.  
`version: '3.8'`

`services:`  
  `# Database chính: MongoDB`  
  `mongo-pos:`  
    `image: mongo:latest`  
    `container_name: mongo-pos`  
    `ports:`  
      `- "27017:27017"`  
    `volumes:`  
      `- ./data:/data/db  # Mount dữ liệu ra ổ cứng thật để backup`  
    `deploy:`  
      `resources:`  
        `limits:`  
          `memory: 2G     # Giới hạn RAM để không làm treo máy thật`

  `# Giao diện quản lý Database (Web UI)`  
  `mongo-express:`  
    `image: mongo-express`  
    `container_name: mongo-express`  
    `ports:`  
      `- "8081:8081"`  
    `environment:`  
      `ME_CONFIG_MONGODB_SERVER: mongo-pos`  
    `depends_on:`  
      `- mongo-pos`

## **3\. Chiến Lược Dữ Liệu (Data Strategy)**

### **3.1. Tư duy NoSQL**

Thay vì tách Orders và OrderDetails (cần JOIN khi query), ta nhúng chi tiết món ăn vào thẳng Object đơn hàng.  
**Cấu trúc JSON mẫu:**  
`{`  
  `"_id": "659d...a1",`  
  `"store_id": 101,`  
  `"created_at": "2026-01-09T10:00:00Z",`  
  `"total_amount": 250000,`  
  `"customer": { "name": "Nguyen Van A", "phone": "098..." },`  
  `"items": [`  
    `{ "product_id": 10, "name": "Gà đồi", "qty": 1, "price": 150000 },`  
    `{ "product_id": 22, "name": "Bia", "qty": 5, "price": 20000 }`  
  `]`  
`}`

### **3.2. Sinh dữ liệu giả (Mock Data)**

Sử dụng thư viện **Bogus** trong C\# để tạo ra dữ liệu chất lượng cao.

* **Mục tiêu:** Tạo 10,000 \- 20,000,000 bản ghi.  
* **Phương pháp:** Bulk Insert (Ghi theo lô) để tối ưu tốc độ.

## **4\. Mã Nguồn C\# (Data Generator)**

Tool Console App dùng để sinh dữ liệu và nạp vào MongoDB.  
**Yêu cầu:**

* .NET 6.0 trở lên.  
* Thư viện: MongoDB.Driver, Bogus.

### **File: Program.cs**

`using MongoDB.Bson;`  
`using MongoDB.Bson.Serialization.Attributes;`  
`using MongoDB.Driver;`  
`using Bogus;` 

`public class Program`  
`{`  
    `// --- KHAI BÁO MODEL DỮ LIỆU ---`  
    `public class Order`  
    `{`  
        `[BsonId]`  
        `[BsonRepresentation(BsonType.ObjectId)]`  
        `public string Id { get; set; }`

        `public int StoreId { get; set; }`  
        `public DateTime CreatedAt { get; set; }`  
        `public CustomerInfo Customer { get; set; }`  
        `public List<OrderItem> Items { get; set; }`  
        `public decimal TotalAmount { get; set; }`  
        `public string PaymentMethod { get; set; }`  
    `}`

    `public class CustomerInfo`  
    `{`  
        `public string Name { get; set; }`  
        `public string Phone { get; set; }`  
    `}`

    `public class OrderItem`  
    `{`  
        `public string ProductName { get; set; }`  
        `public int Quantity { get; set; }`  
        `public decimal Price { get; set; }`  
    `}`

    `// --- MAIN EXECUTION ---`  
    `public static async Task Main(string[] args)`  
    `{`  
        `Console.WriteLine("--- POS BIG DATA GENERATOR ---");`

        `// 1. Kết nối MongoDB Local`  
        `var connectionString = "mongodb://localhost:27017";`  
        `var client = new MongoClient(connectionString);`  
        `var database = client.GetDatabase("PosBigData");`  
        `var collection = database.GetCollection<Order>("Orders");`

        `Console.WriteLine("-> Đã kết nối MongoDB thành công.");`

        `// 2. Cấu hình quy tắc sinh dữ liệu (Bogus)`  
        `var productFaker = new Faker<OrderItem>()`  
            `.RuleFor(i => i.ProductName, f => f.Commerce.ProductName())`  
            `.RuleFor(i => i.Quantity, f => f.Random.Number(1, 10))`  
            `.RuleFor(i => i.Price, f => decimal.Parse(f.Commerce.Price(10000, 500000)));`

        `var orderFaker = new Faker<Order>()`  
            `.RuleFor(o => o.StoreId, f => f.Random.Number(1, 50)) // 50 Cửa hàng`  
            `.RuleFor(o => o.CreatedAt, f => f.Date.Past(2))       // Dữ liệu 2 năm qua`  
            `.RuleFor(o => o.PaymentMethod, f => f.PickRandom("CASH", "QR", "CARD"))`  
            `.RuleFor(o => o.Customer, f => new CustomerInfo {`   
                `Name = f.Name.FullName(),`   
                `Phone = f.Phone.PhoneNumber("09########")`   
            `})`  
            `.RuleFor(o => o.Items, f => productFaker.Generate(f.Random.Number(1, 5)));`

        `// 3. Thực thi Insert theo Lô (Batch Insert)`  
        `int totalRecords = 10000; // Thay đổi số này để tăng lượng dữ liệu (Ví dụ: 1,000,000)`  
        `int batchSize = 1000;     // Kích thước mỗi gói gửi đi`  
          
        `Console.WriteLine($"-> Bắt đầu sinh {totalRecords} đơn hàng...");`  
          
        `var batch = new List<Order>();`  
        `var watch = System.Diagnostics.Stopwatch.StartNew();`

        `for (int i = 0; i < totalRecords; i++)`  
        `{`  
            `var order = orderFaker.Generate();`  
            `// Tính tổng tiền tự động`  
            `order.TotalAmount = order.Items.Sum(x => x.Quantity * x.Price);`  
              
            `batch.Add(order);`

            `// Khi gom đủ 1000 đơn thì bắn vào DB một lần`  
            `if (batch.Count >= batchSize)`  
            `{`  
                `await collection.InsertManyAsync(batch);`  
                `Console.Write($"\rProgress: {i + 1}/{totalRecords} records...");`  
                `batch.Clear();`  
            `}`  
        `}`

        `// Insert nốt số lẻ còn lại`  
        `if (batch.Count > 0) await collection.InsertManyAsync(batch);`

        `watch.Stop();`  
        `Console.WriteLine($"\n\nHOÀN TẤT! Tổng thời gian: {watch.Elapsed.TotalSeconds:N2} giây.");`  
        `Console.WriteLine("Kiểm tra dữ liệu tại: http://localhost:8081");`  
    `}`  
`}`

## **5\. Kế Hoạch Hành Động (Next Steps)**

1. **Cài đặt:** Cài Docker Desktop trên máy.  
2. **Khởi chạy DB:** Chạy file docker-compose.yml.  
3. **Chạy Tool C\#:** Chạy code C\# trên để bơm thử 10,000 bản ghi đầu tiên.  
4. **Kiểm tra:** Mở trình duyệt vào localhost:8081 để soi dữ liệu.  
5. **Scale Up:** Tăng số lượng bản ghi lên 1 triệu, 5 triệu để cảm nhận tốc độ và hiệu năng.