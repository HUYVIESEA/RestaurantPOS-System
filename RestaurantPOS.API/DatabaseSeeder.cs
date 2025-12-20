using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API
{
    /// <summary>
    /// Database Seeder - Seeds initial data including Manager role users
    /// </summary>
    public class DatabaseSeeder
    {
        private readonly ApplicationDbContext _context;

        public DatabaseSeeder(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Seed all initial data
        /// </summary>
        public async Task SeedAllAsync()
        {
            Console.WriteLine("========================================");
            Console.WriteLine("Database Seeding Started");
            Console.WriteLine("========================================");

            await SeedUsersAsync();
            await SeedBunDauDataAsync();
            await SeedDrinksDataAsync();
            await SeedGrilledDishesDataAsync();
            await SeedSideDishesDataAsync();
            await SeedTablesDataAsync();
            await SeedSampleOrdersAsync();
            await DisplayStatisticsAsync();

            Console.WriteLine("========================================");
            Console.WriteLine("Database Seeding Completed");
            Console.WriteLine("========================================");
        }

        /// <summary>
        /// Seed default users (Admin, Manager, Staff)
        /// </summary>
        private async Task SeedUsersAsync()
        {
            Console.WriteLine("\n--- Seeding Users ---");

            // Admin User
            if (!await _context.Users.AnyAsync(u => u.Username == "admin"))
            {
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@restaurantpos.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    FullName = "Quản trị viên hệ thống",
                    PhoneNumber = "0123456789",
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(admin);
                Console.WriteLine("✅ Created Admin user");
            }
            else
            {
                Console.WriteLine("⏭️  Admin user already exists");
            }

            // Manager User
            if (!await _context.Users.AnyAsync(u => u.Username == "manager"))
            {
                var manager = new User
                {
                    Username = "manager",
                    Email = "manager@restaurantpos.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123"),
                    FullName = "Quản lý nhà hàng",
                    PhoneNumber = "0987654321",
                    Role = "Manager",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(manager);
                Console.WriteLine("✅ Created Manager user");
            }
            else
            {
                Console.WriteLine("⏭️  Manager user already exists");
            }

            // Staff User
            if (!await _context.Users.AnyAsync(u => u.Username == "staff"))
            {
                var staff = new User
                {
                    Username = "staff",
                    Email = "staff@restaurantpos.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                    FullName = "Nhân viên phục vụ",
                    PhoneNumber = "0369852147",
                    Role = "Staff",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(staff);
                Console.WriteLine("✅ Created Staff user");
            }
            else
            {
                Console.WriteLine("⏭️  Staff user already exists");
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed data related to Bún đậu mắm tôm
        /// </summary>
        private async Task SeedBunDauDataAsync()
        {
            Console.WriteLine("\n--- Seeding Bún Đậu Data ---");

            // 1. Ensure Category "Món Bún Đậu" exists
            var categoryName = "Món Bún Đậu";
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == categoryName);
            
            if (category == null)
            {
                category = new Category 
                { 
                    Name = categoryName, 
                    Description = "Các món bún đậu mắm tôm và món ăn kèm đặc sắc" 
                };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Created category '{categoryName}'");
            }
            else
            {
                Console.WriteLine($"⏭️  Category '{categoryName}' already exists");
            }

            // 2. Add Products (Variations and Sides)
            var products = new List<Product>
            {
                // Main Dishes
                new Product 
                { 
                    Name = "Bún đậu mắm tôm (Thường)", 
                    Description = "Suất bún đậu truyền thống với đậu mơ rán giòn và mắm tôm pha ngon.", 
                    Price = 35000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product 
                { 
                    Name = "Bún đậu đầy đủ", 
                    Description = "Bún đậu, thịt chân giò luộc, chả cốm, nem rán.", 
                    Price = 55000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product 
                { 
                    Name = "Bún đậu tá lả", 
                    Description = "Suất đặc biệt đầy đủ các loại topping: Thịt, chả cốm, nem rán, dồi sụn.", 
                    Price = 75000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                
                // Side Dishes (Toppings)
                new Product 
                { 
                    Name = "Chả cốm (Thêm)", 
                    Description = "Chả cốm chiên nóng hổi.", 
                    Price = 15000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/chacom.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product 
                { 
                    Name = "Nem rán (Thêm)", 
                    Description = "Nem rán giòn rụm.", 
                    Price = 15000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/nemran.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product 
                { 
                    Name = "Dồi sụn (Thêm)", 
                    Description = "Dồi sụn nướng thơm lừng.", 
                    Price = 20000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/doisun.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product 
                { 
                    Name = "Thịt chân giò (Thêm)", 
                    Description = "Thịt chân giò luộc thái lát.", 
                    Price = 25000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/thitchangio.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                }
            };

            foreach (var p in products)
            {
                var existing = await _context.Products.FirstOrDefaultAsync(x => x.Name == p.Name);
                if (existing == null)
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added product '{p.Name}'");
                }
                else
                {
                    existing.ImageUrl = p.ImageUrl;
                    existing.StockQuantity = p.StockQuantity;
                    _context.Products.Update(existing);
                    Console.WriteLine($"🔄 Updated product '{p.Name}' image");
                }
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed data related to Drinks
        /// </summary>
        private async Task SeedDrinksDataAsync()
        {
            Console.WriteLine("\n--- Seeding Drinks Data ---");

            // 1. Ensure Category "Đồ uống" exists
            var categoryName = "Đồ uống";
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == categoryName);

            if (category == null)
            {
                category = new Category
                {
                    Name = categoryName,
                    Description = "Các loại đồ uống giải khát, bia và nước ngọt"
                };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Created category '{categoryName}'");
            }
            else
            {
                Console.WriteLine($"⏭️  Category '{categoryName}' already exists");
            }

            // 2. Add Drink Products
            var drinks = new List<Product>
            {
                // Traditional Drinks
                new Product
                {
                    Name = "Trà đá",
                    Description = "Trà xanh tươi hãm nóng, phục vụ với đá lạnh.",
                    Price = 5000,
                    CategoryId = category.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Trà chanh",
                    Description = "Trà xanh pha với nước cốt chanh tươi và đường.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Nước sấu",
                    Description = "Nước sấu ngâm đường gừng, chua ngọt thanh mát.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Nước mơ",
                    Description = "Nước mơ ngâm đường, giải nhiệt mùa hè.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Sữa đậu nành",
                    Description = "Sữa đậu nành nhà làm, thơm ngon béo ngậy.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },

                // Soft Drinks
                new Product
                {
                    Name = "Coca Cola",
                    Description = "Nước ngọt có ga Coca Cola (Lon 330ml).",
                    Price = 20000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/coca.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Pepsi",
                    Description = "Nước ngọt có ga Pepsi (Lon 330ml).",
                    Price = 20000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/pepsi.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Nước suối",
                    Description = "Nước khoáng thiên nhiên (Chai 500ml).",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/nuocsuoi.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },

                // Beer
                new Product
                {
                    Name = "Bia Hà Nội",
                    Description = "Bia Hà Nội (Chai/Lon).",
                    Price = 25000,
                    CategoryId = category.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Bia Sài Gòn",
                    Description = "Bia Sài Gòn Lager (Chai/Lon).",
                    Price = 25000,
                    CategoryId = category.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800",
                    IsAvailable = true,
                    StockQuantity = 100
                }
            };

            foreach (var p in drinks)
            {
                var existing = await _context.Products.FirstOrDefaultAsync(x => x.Name == p.Name);
                if (existing == null)
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added drink '{p.Name}'");
                }
                else
                {
                    existing.ImageUrl = p.ImageUrl;
                    existing.StockQuantity = p.StockQuantity;
                    _context.Products.Update(existing);
                    Console.WriteLine($"🔄 Updated drink '{p.Name}' image");
                }
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed data related to Grilled Dishes
        /// </summary>
        private async Task SeedGrilledDishesDataAsync()
        {
            Console.WriteLine("\n--- Seeding Grilled Dishes Data ---");

            // 1. Ensure Category "Món Nướng" exists
            var categoryName = "Món Nướng";
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == categoryName);

            if (category == null)
            {
                category = new Category
                {
                    Name = categoryName,
                    Description = "Các món nướng than hoa thơm ngon đậm đà"
                };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Created category '{categoryName}'");
            }
            else
            {
                Console.WriteLine($"⏭️  Category '{categoryName}' already exists");
            }

            // 2. Add Grilled Products
            var grilledDishes = new List<Product>
            {
                new Product
                {
                    Name = "Ba chỉ nướng riềng mẻ",
                    Description = "Thịt ba chỉ ướp riềng mẻ nướng than hoa vàng ruộm.",
                    Price = 65000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/bachinuong.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Nầm lợn nướng",
                    Description = "Nầm lợn nướng giòn sần sật, tẩm ướp gia vị đặc biệt.",
                    Price = 75000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/namnuong.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Dải lợn nướng",
                    Description = "Thịt dải lợn nướng thơm mềm, không bị khô.",
                    Price = 70000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/dainuong.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Bò cuốn nấm kim châm",
                    Description = "Thịt bò ba chỉ cuộn nấm kim châm nướng sốt BBQ.",
                    Price = 80000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/bocuonnam.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Chân gà nướng",
                    Description = "Chân gà nướng mật ong vàng óng, thơm lừng.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/changanuong.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Cánh gà nướng",
                    Description = "Cánh gà nướng muối ớt cay nồng.",
                    Price = 25000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/canhganuong.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Sườn sụn nướng",
                    Description = "Sườn sụn non nướng ngũ vị hương.",
                    Price = 70000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/suonsunnuong.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                }
            };

            foreach (var p in grilledDishes)
            {
                var existing = await _context.Products.FirstOrDefaultAsync(x => x.Name == p.Name);
                if (existing == null)
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added grilled dish '{p.Name}'");
                }
                else
                {
                    existing.ImageUrl = p.ImageUrl;
                    existing.StockQuantity = p.StockQuantity;
                    _context.Products.Update(existing);
                    Console.WriteLine($"🔄 Updated grilled dish '{p.Name}' image");
                }
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed data related to Side Dishes
        /// </summary>
        private async Task SeedSideDishesDataAsync()
        {
            Console.WriteLine("\n--- Seeding Side Dishes Data ---");

            // 1. Ensure Category "Món Ăn Kèm" exists
            var categoryName = "Món Ăn Kèm";
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == categoryName);

            if (category == null)
            {
                category = new Category
                {
                    Name = categoryName,
                    Description = "Các món ăn kèm, khai vị nhẹ nhàng"
                };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Created category '{categoryName}'");
            }
            else
            {
                Console.WriteLine($"⏭️  Category '{categoryName}' already exists");
            }

            // 2. Add Side Dish Products
            var sideDishes = new List<Product>
            {
                new Product
                {
                    Name = "Dưa chuột chẻ",
                    Description = "Dưa chuột tươi chẻ miếng, chấm muối ớt.",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/duachuot.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Rau sống",
                    Description = "Rổ rau sống tươi ngon theo mùa (Xà lách, tía tô, kinh giới...).",
                    Price = 5000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/rausong.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Bún lá (Thêm)",
                    Description = "Đĩa bún lá tươi cắt miếng.",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/bunla.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Bánh mì nướng mật ong",
                    Description = "Bánh mì nướng giòn phết mật ong thơm lừng.",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/banhmi.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Khoai tây chiên",
                    Description = "Khoai tây chiên bơ tỏi giòn rụm.",
                    Price = 30000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/khoaitaychien.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Ngô chiên",
                    Description = "Ngô ngọt chiên bơ.",
                    Price = 30000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/ngochien.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Khoai lang kén",
                    Description = "Khoai lang kén vàng ươm, thơm mùi cốt dừa.",
                    Price = 30000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/khoailangken.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                },
                new Product
                {
                    Name = "Kim chi",
                    Description = "Kim chi cải thảo muối cay.",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/kimchi.jpg",
                    IsAvailable = true,
                    StockQuantity = 100
                }
            };

            foreach (var p in sideDishes)
            {
                var existing = await _context.Products.FirstOrDefaultAsync(x => x.Name == p.Name);
                if (existing == null)
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added side dish '{p.Name}'");
                }
                else
                {
                    existing.ImageUrl = p.ImageUrl;
                    existing.StockQuantity = p.StockQuantity;
                    _context.Products.Update(existing);
                    Console.WriteLine($"🔄 Updated side dish '{p.Name}' image");
                }
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed data related to Tables
        /// </summary>
        private async Task SeedTablesDataAsync()
        {
            Console.WriteLine("\n--- Seeding Tables Data ---");

            if (await _context.Tables.AnyAsync())
            {
                Console.WriteLine("⏭️  Tables already exist. Skipping...");
                return;
            }

            var tables = new List<Table>();

            // Definition of floors and their configurations
            var floorConfigs = new[]
            {
                new { Name = "Tầng 1", Prefix = "T1", Count = 12, Capacity = 4 },
                new { Name = "Tầng 2", Prefix = "T2", Count = 10, Capacity = 4 },
                new { Name = "Tầng 3", Prefix = "T3", Count = 10, Capacity = 4 },
                new { Name = "Tầng 4", Prefix = "T4", Count = 8, Capacity = 4 },
                new { Name = "Tầng 5", Prefix = "T5", Count = 8, Capacity = 4 },
                new { Name = "Tầng trệt", Prefix = "G", Count = 6, Capacity = 4 },
                new { Name = "Tầng lửng", Prefix = "L", Count = 6, Capacity = 4 },
                new { Name = "Sân thượng", Prefix = "ST", Count = 15, Capacity = 4 },
                new { Name = "Khu VIP", Prefix = "VIP", Count = 5, Capacity = 10 },
                new { Name = "Khu ngoài trời", Prefix = "NT", Count = 10, Capacity = 6 },
                new { Name = "Khu gia đình", Prefix = "GĐ", Count = 8, Capacity = 8 }
            };

            foreach (var config in floorConfigs)
            {
                for (int i = 1; i <= config.Count; i++)
                {
                    tables.Add(new Table
                    {
                        TableNumber = $"{config.Prefix}-{i:00}",
                        Capacity = config.Capacity,
                        Floor = config.Name,
                        IsAvailable = true,
                        IsMerged = false
                    });
                }
            }

            await _context.Tables.AddRangeAsync(tables);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"✅ Added {tables.Count} tables across {floorConfigs.Length} floors/areas");
        }


        /// <summary>
        /// Seed sample orders for dashboard testing
        /// </summary>
        private async Task SeedSampleOrdersAsync()
        {
            Console.WriteLine("\n--- Seeding Sample Orders ---");

            if (await _context.Orders.CountAsync() > 200)
            {
                Console.WriteLine("⏭️  Orders already exist (>200). Skipping...");
                return;
            }

            var products = await _context.Products.ToListAsync();
            var tables = await _context.Tables.ToListAsync();
            var users = await _context.Users.ToListAsync();
            var staff = users.FirstOrDefault(u => u.Role == "Staff") ?? users.First();

            if (!products.Any() || !tables.Any())
            {
                Console.WriteLine("⚠️  Cannot seed orders: No products or tables found.");
                return;
            }

            var random = new Random();
            var orders = new List<Order>();

            for (int i = 0; i < 100; i++)
            {
                var daysAgo = random.Next(0, 7);
                // Fix: Use UtcNow.Date and offset for VN hours (0-15h UTC = 7-22h VN)
                var orderDate = DateTime.UtcNow.Date.AddDays(-daysAgo).AddHours(random.Next(0, 16)); 
                var isCompleted = daysAgo > 0 || random.NextDouble() > 0.2; // Past orders are completed
                var status = isCompleted ? "Completed" : (random.NextDouble() > 0.5 ? "Pending" : "Processing");
                var table = tables[random.Next(tables.Count)];

                var order = new Order
                {
                    TableId = table.Id,
                    // UserId removed
                    OrderDate = orderDate,
                    Status = status,
                    TotalAmount = 0, // Will be calculated
                    PaymentMethod = isCompleted ? (random.NextDouble() > 0.3 ? "Cash" : "Transfer") : "Pending",
                    // OriginalTotalAmount removed
                    // CreatedByUserId removed
                    // CreatedAt, UpdatedAt removed if not in model (Order.cs didn't show them, except OrderDate)
                };

                // Add random items (2-5 items per order)
                var itemCount = random.Next(2, 6);
                var orderItems = new List<OrderItem>();
                decimal total = 0;

                for (int j = 0; j < itemCount; j++)
                {
                    var product = products[random.Next(products.Count)];
                    var quantity = random.Next(1, 4);
                    
                    orderItems.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        // ProductName removed if not in model. OrderItem.cs didn't show ProductName.
                        Quantity = quantity,
                        UnitPrice = product.Price,
                        // TotalPrice removed if not in model
                        Notes = random.NextDouble() > 0.8 ? "Ít cay" : null // Changed Note to Notes
                    });

                    total += product.Price * quantity;
                }

                order.OrderItems = orderItems;
                order.TotalAmount = total;
                // OriginalTotalAmount removed

                orders.Add(order);
            }

            // Add batch
            await _context.Orders.AddRangeAsync(orders);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"✅ Created {orders.Count} sample orders for the last 7 days.");
        }

        /// <summary>
        /// Display database statistics
        /// </summary>
        private async Task DisplayStatisticsAsync()
        {
            Console.WriteLine("\n--- Database Statistics ---");

            // User statistics by role
            var userStats = await _context.Users
                .GroupBy(u => u.Role)
                .Select(g => new
                {
                    Role = g.Key,
                    Total = g.Count(),
                    Active = g.Count(u => u.IsActive)
                })
                .ToListAsync();

            Console.WriteLine("\nUsers by Role:");
            foreach (var stat in userStats.OrderBy(s => s.Role))
            {
                Console.WriteLine($"  {stat.Role,-10}: {stat.Total,3} total, {stat.Active,3} active");
            }

            // Other statistics
            var productCount = await _context.Products.CountAsync();
            var categoryCount = await _context.Categories.CountAsync();
            var tableCount = await _context.Tables.CountAsync();
            var orderCount = await _context.Orders.CountAsync();

            Console.WriteLine("\nOther Entities:");
            Console.WriteLine($"  Products  : {productCount}");
            Console.WriteLine($"  Categories: {categoryCount}");
            Console.WriteLine($"  Tables    : {tableCount}");
            Console.WriteLine($"  Orders    : {orderCount}");

            // Validation
            var hasAllRoles = userStats.Any(s => s.Role == "Admin") &&
                             userStats.Any(s => s.Role == "Manager") &&
                             userStats.Any(s => s.Role == "Staff");

            Console.WriteLine("\nValidation:");
            if (hasAllRoles)
            {
                Console.WriteLine("  ✅ All three roles (Admin, Manager, Staff) are present");
            }
            else
            {
                Console.WriteLine("  ⚠️  WARNING: Not all roles are present!");
            }
        }

        /// <summary>
        /// List all users
        /// </summary>
        public async Task ListAllUsersAsync()
        {
            Console.WriteLine("\n--- All Users ---");

            var users = await _context.Users
                .OrderBy(u => u.Role)
                .ThenBy(u => u.Username)
                .ToListAsync();

            Console.WriteLine($"\n{"ID",-5} {"Username",-15} {"Email",-30} {"Role",-10} {"Active",-8}");
            Console.WriteLine(new string('-', 80));

            foreach (var user in users)
            {
                Console.WriteLine($"{user.Id,-5} {user.Username,-15} {user.Email,-30} {user.Role,-10} {(user.IsActive ? "Yes" : "No"),-8}");
            }
        }
    }
}
