using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Bogus;

namespace RestaurantPOS.BigDataGenerator;

public class Program
{
    // --- KHAI BÁO MODEL DỮ LIỆU ---
    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public int StoreId { get; set; }
        public DateTime CreatedAt { get; set; }
        public CustomerInfo Customer { get; set; } = null!;
        public List<OrderItem> Items { get; set; } = new();

        [BsonRepresentation(BsonType.Decimal128)]
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = null!;
    }

    public class CustomerInfo
    {
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
    }

    public class OrderItem
    {
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        
        [BsonRepresentation(BsonType.Decimal128)]
        public decimal Price { get; set; }
    }

    // --- MAIN EXECUTION ---
    public static async Task Main(string[] args)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.WriteLine("--- POS BIG DATA GENERATOR (Roadmap Impl) ---");

        // 1. Kết nối MongoDB Local
        var mongoConnStr = Environment.GetEnvironmentVariable("MONGODB_URI") ?? "mongodb://localhost:27017";
        
        Console.WriteLine("\nChoose mode:");
        Console.WriteLine("1. Generate Data (Big Data)");
        Console.WriteLine("2. Test System Connectivity (Mongo + Postgres)");
        Console.WriteLine("3. Run Big Data Analytics (Aggregations)");
        Console.Write("Select (1/2/3): ");
        var choice = Console.ReadLine();

        if (choice == "2")
        {
            await RunSystemTest(mongoConnStr);
            return;
        }
        else if (choice == "3")
        {
            await RunAnalytics(mongoConnStr);
            return;
        }

        Console.WriteLine($"\n-> Connecting to MongoDB at: {mongoConnStr}");

        try 
        {
            var client = new MongoClient(mongoConnStr);
            var database = client.GetDatabase("PosBigData");
            
            // Ping để kiểm tra kết nối
            await database.RunCommandAsync((Command<BsonDocument>)"{ping:1}");
            Console.WriteLine("-> Connected successfully!");

            var collection = database.GetCollection<Order>("Orders");

            // CLEAR OLD DATA (Important for regeneration)
            await database.DropCollectionAsync("Orders");
            Console.WriteLine("-> Cleared old data (Dropped Collection).");

            // 2. Cấu hình quy tắc sinh dữ liệu (Bogus)
            // Set seed để dữ liệu sinh ra giống nhau mỗi lần chạy (nếu muốn) - bỏ qua để ngẫu nhiên
            // Randomizer.Seed = new Random(8675309);

            var productFaker = new Faker<OrderItem>()
                .RuleFor(i => i.ProductName, f => f.Commerce.ProductName())
                .RuleFor(i => i.Quantity, f => f.Random.Number(1, 10))
                .RuleFor(i => i.Price, f => decimal.Parse(f.Commerce.Price(10000, 500000)));

            var orderFaker = new Faker<Order>()
                .RuleFor(o => o.StoreId, f => f.Random.Number(1, 50)) // 50 Cửa hàng
                .RuleFor(o => o.CreatedAt, f => f.Date.Past(2))       // Dữ liệu 2 năm qua
                .RuleFor(o => o.PaymentMethod, f => f.PickRandom("CASH", "QR", "CARD"))
                .RuleFor(o => o.Customer, f => new CustomerInfo { 
                    Name = f.Name.FullName(), 
                    Phone = f.Phone.PhoneNumber("09########") 
                })
                .RuleFor(o => o.Items, f => productFaker.Generate(f.Random.Number(1, 5)));

            // 3. Thực thi Insert
            Console.Write("Enter number of records to generate (default 10000): ");
            string? inputVal = Console.ReadLine();
            int totalRecords = 10000;
            if (int.TryParse(inputVal, out int parsed))
            {
                totalRecords = parsed;
            }

            int batchSize = 1000;     // Kích thước mỗi gói gửi đi
            Console.WriteLine($"-> Starting generation of {totalRecords:N0} records...");
            
            var batch = new List<Order>(batchSize);
            var watch = System.Diagnostics.Stopwatch.StartNew();

            for (int i = 0; i < totalRecords; i++)
            {
                var order = orderFaker.Generate();
                // Tính tổng tiền tự động
                order.TotalAmount = order.Items.Sum(x => x.Quantity * x.Price);
                
                batch.Add(order);

                // Khi gom đủ batchSize đơn thì bắn vào DB một lần
                if (batch.Count >= batchSize)
                {
                    await collection.InsertManyAsync(batch);
                    Console.Write($"\rProgress: {i + 1}/{totalRecords} records ({(double)(i+1)/totalRecords*100:F1}%)...");
                    batch.Clear();
                }
            }

            // Insert nốt số lẻ còn lại
            if (batch.Count > 0) 
            {
                await collection.InsertManyAsync(batch);
                Console.Write($"\rProgress: {totalRecords}/{totalRecords} records (100.0%)...");
            }

            watch.Stop();
            Console.WriteLine($"\n\nCOMPLETED! Total time: {watch.Elapsed.TotalSeconds:N2} seconds.");
            Console.WriteLine($"Rate: {totalRecords / watch.Elapsed.TotalSeconds:N0} records/sec");
            Console.WriteLine("Check data at: http://localhost:8081");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n\n[ERROR] Could not connect or insert to MongoDB.");
            Console.WriteLine($"Message: {ex.Message}");
            Console.WriteLine("Please ensure Docker is running (docker-compose up -d) or MongoDB is installed.");
        }
    }

    private static async Task RunSystemTest(string mongoConnStr)
    {
        Console.WriteLine("\n--- SYSTEM HEALTH CHECK ---");

        // 1. Check MongoDB
        Console.Write("[1] Testing MongoDB... ");
        try
        {
            var client = new MongoClient(mongoConnStr);
            var db = client.GetDatabase("PosBigData");
            await db.RunCommandAsync((Command<BsonDocument>)"{ping:1}");
            var count = await db.GetCollection<Order>("Orders").CountDocumentsAsync(new BsonDocument());
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"OK! (Found {count:N0} orders)");
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"FAILED! {ex.Message}");
        }
        Console.ResetColor();

        // 2. Check PostgreSQL
        Console.Write("[2] Testing PostgreSQL... ");
        try
        {
            // Simple check using TcpClient first to avoid Npgsql dependency if not present,
            // but since user system has it, we assume we might need the package.
            // Actually, let's just check the TCP port first to be safe and simple without adding more deps yet.
            using var tcp = new System.Net.Sockets.TcpClient();
            await tcp.ConnectAsync("localhost", 5432);
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("OK! (Port 5432 Open)");
            // Note: detailed login check requires Npgsql, can add if needed.
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"FAILED! {ex.Message}");
        }
        Console.ResetColor();
    }

    private static async Task RunAnalytics(string mongoConnStr)
    {
        Console.WriteLine("\n--- BIG DATA ANALYTICS (MongoDB Aggregation) ---");
        var client = new MongoClient(mongoConnStr);
        var collection = client.GetDatabase("PosBigData").GetCollection<Order>("Orders");

        // 1. Top 5 Stores by Revenue
        Console.WriteLine("\n[1] Calculating Top 5 Stores by Revenue...");
        var watch = System.Diagnostics.Stopwatch.StartNew();
        
        var topStores = await collection.Aggregate()
            .Group(new BsonDocument 
            {
                { "_id", "$StoreId" },
                { "TotalRevenue", new BsonDocument("$sum", "$TotalAmount") }
            })
            .Sort(new BsonDocument("TotalRevenue", -1))
            .Limit(5)
            .ToListAsync();

        watch.Stop();
        watch.Stop();
        foreach (var s in topStores) 
        {
             // Helper to read number
             decimal rev = 0;
             var val = s["TotalRevenue"];
             if (val.IsDecimal128) rev = (decimal)val.AsDecimal128;
             else if (val.IsDouble) rev = (decimal)val.AsDouble;
             else if (val.IsInt32) rev = val.AsInt32;
             else if (val.IsInt64) rev = val.AsInt64;

             Console.WriteLine($"   Store #{s["_id"]}: {rev:N0} VND");
        }
        Console.WriteLine($"   -> Time: {watch.ElapsedMilliseconds}ms");

        // 2. Top 5 Best Selling Products
        Console.WriteLine("\n[2] Calculating Top 5 Best Selling Products...");
        watch.Restart();
        
        var topProducts = await collection.Aggregate()
            .Unwind<Order, Order>(x => x.Items) // Flatten array
            // Note: In C# driver strongly typed Unwind matches to Order, 
            // but we need to project/group dynamically since we are reaching into nested items.
            // Using BsonDocument for flexibility here is often easier for complex unwinds.
            .Project(new BsonDocument { { "Name", "$Items.ProductName" }, { "Qty", "$Items.Quantity" } })
            .Group(new BsonDocument 
            { 
                { "_id", "$Name" },
                { "TotalSold", new BsonDocument("$sum", "$Qty") } 
            })
            .Sort(new BsonDocument("TotalSold", -1))
            .Limit(5)
            .ToListAsync();

        watch.Stop();
        foreach (var p in topProducts) 
        {
            Console.WriteLine($"   Product: {p["_id"]} - Sold: {p["TotalSold"]}");
        }
        Console.WriteLine($"   -> Time: {watch.ElapsedMilliseconds}ms");

        // 3. Monthly Revenue (Last 6 months)
        // Note: For date grouping, simpler to use BsonDocument to access $year/$month operators
        Console.WriteLine("\n[3] Calculating Monthly Revenue Trends...");
        watch.Restart();

        var revenueTrend = await collection.Aggregate()
            .Project(new BsonDocument 
            { 
                { "Year", new BsonDocument("$year", "$CreatedAt") },
                { "Month", new BsonDocument("$month", "$CreatedAt") },
                { "Amount", "$TotalAmount" }
            })
            .Group(new BsonDocument 
                { 
                    { "_id", new BsonDocument { { "Year", "$Year" }, { "Month", "$Month" } } },
                    { "MonthlySales", new BsonDocument("$sum", "$Amount") }
                }
            )
            .Sort(new BsonDocument 
            { 
                { "_id.Year", -1 }, 
                { "_id.Month", -1 } 
            })
            .Limit(6)
            .ToListAsync();

        watch.Stop();
        foreach (var t in revenueTrend)
        {
            // Handle different numeric types (Int32/Int64/Double/Decimal128)
            decimal val = 0;
            if (t["MonthlySales"].IsDecimal128) val = (decimal)t["MonthlySales"].AsDecimal128;
            else if (t["MonthlySales"].IsDouble) val = (decimal)t["MonthlySales"].AsDouble;
            else if (t["MonthlySales"].IsInt32) val = t["MonthlySales"].AsInt32;
            else if (t["MonthlySales"].IsInt64) val = t["MonthlySales"].AsInt64;

            Console.WriteLine($"   {t["_id"]["Month"]}/{t["_id"]["Year"]}: {val:N0} VND");
        }
        Console.WriteLine($"   -> Time: {watch.ElapsedMilliseconds}ms");
    }
}
