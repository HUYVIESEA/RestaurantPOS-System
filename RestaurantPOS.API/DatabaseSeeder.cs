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
                    ImageUrl = "https://example.com/bundau-thuong.jpg",
                    IsAvailable = true
                },
                new Product 
                { 
                    Name = "Bún đậu đầy đủ", 
                    Description = "Bún đậu, thịt chân giò luộc, chả cốm, nem rán.", 
                    Price = 55000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/bundau-full.jpg",
                    IsAvailable = true
                },
                new Product 
                { 
                    Name = "Bún đậu tá lả", 
                    Description = "Suất đặc biệt đầy đủ các loại topping: Thịt, chả cốm, nem rán, dồi sụn.", 
                    Price = 75000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/bundau-tala.jpg",
                    IsAvailable = true
                },
                
                // Side Dishes (Toppings)
                new Product 
                { 
                    Name = "Chả cốm (Thêm)", 
                    Description = "Chả cốm chiên nóng hổi.", 
                    Price = 15000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/chacom.jpg",
                    IsAvailable = true
                },
                new Product 
                { 
                    Name = "Nem rán (Thêm)", 
                    Description = "Nem rán giòn rụm.", 
                    Price = 15000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/nemran.jpg",
                    IsAvailable = true
                },
                new Product 
                { 
                    Name = "Dồi sụn (Thêm)", 
                    Description = "Dồi sụn nướng thơm lừng.", 
                    Price = 20000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/doisun.jpg",
                    IsAvailable = true
                },
                new Product 
                { 
                    Name = "Thịt chân giò (Thêm)", 
                    Description = "Thịt chân giò luộc thái lát.", 
                    Price = 25000, 
                    CategoryId = category.Id, 
                    ImageUrl = "https://example.com/thitchangio.jpg",
                    IsAvailable = true
                }
            };

            foreach (var p in products)
            {
                if (!await _context.Products.AnyAsync(x => x.Name == p.Name))
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added product '{p.Name}'");
                }
                else
                {
                    Console.WriteLine($"⏭️  Product '{p.Name}' already exists");
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
                    ImageUrl = "https://example.com/trada.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Trà chanh",
                    Description = "Trà xanh pha với nước cốt chanh tươi và đường.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/trachanh.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Nước sấu",
                    Description = "Nước sấu ngâm đường gừng, chua ngọt thanh mát.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/nuocsau.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Nước mơ",
                    Description = "Nước mơ ngâm đường, giải nhiệt mùa hè.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/nuocmo.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Sữa đậu nành",
                    Description = "Sữa đậu nành nhà làm, thơm ngon béo ngậy.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/suadaunanh.jpg",
                    IsAvailable = true
                },

                // Soft Drinks
                new Product
                {
                    Name = "Coca Cola",
                    Description = "Nước ngọt có ga Coca Cola (Lon 330ml).",
                    Price = 20000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/coca.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Pepsi",
                    Description = "Nước ngọt có ga Pepsi (Lon 330ml).",
                    Price = 20000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/pepsi.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Nước suối",
                    Description = "Nước khoáng thiên nhiên (Chai 500ml).",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/nuocsuoi.jpg",
                    IsAvailable = true
                },

                // Beer
                new Product
                {
                    Name = "Bia Hà Nội",
                    Description = "Bia Hà Nội (Chai/Lon).",
                    Price = 25000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/biahanoi.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Bia Sài Gòn",
                    Description = "Bia Sài Gòn Lager (Chai/Lon).",
                    Price = 25000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/biasaigon.jpg",
                    IsAvailable = true
                }
            };

            foreach (var p in drinks)
            {
                if (!await _context.Products.AnyAsync(x => x.Name == p.Name))
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added drink '{p.Name}'");
                }
                else
                {
                    Console.WriteLine($"⏭️  Drink '{p.Name}' already exists");
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
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Nầm lợn nướng",
                    Description = "Nầm lợn nướng giòn sần sật, tẩm ướp gia vị đặc biệt.",
                    Price = 75000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/namnuong.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Dải lợn nướng",
                    Description = "Thịt dải lợn nướng thơm mềm, không bị khô.",
                    Price = 70000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/dainuong.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Bò cuốn nấm kim châm",
                    Description = "Thịt bò ba chỉ cuộn nấm kim châm nướng sốt BBQ.",
                    Price = 80000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/bocuonnam.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Chân gà nướng",
                    Description = "Chân gà nướng mật ong vàng óng, thơm lừng.",
                    Price = 15000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/changanuong.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Cánh gà nướng",
                    Description = "Cánh gà nướng muối ớt cay nồng.",
                    Price = 25000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/canhganuong.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Sườn sụn nướng",
                    Description = "Sườn sụn non nướng ngũ vị hương.",
                    Price = 70000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/suonsunnuong.jpg",
                    IsAvailable = true
                }
            };

            foreach (var p in grilledDishes)
            {
                if (!await _context.Products.AnyAsync(x => x.Name == p.Name))
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added grilled dish '{p.Name}'");
                }
                else
                {
                    Console.WriteLine($"⏭️  Grilled dish '{p.Name}' already exists");
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
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Rau sống",
                    Description = "Rổ rau sống tươi ngon theo mùa (Xà lách, tía tô, kinh giới...).",
                    Price = 5000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/rausong.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Bún lá (Thêm)",
                    Description = "Đĩa bún lá tươi cắt miếng.",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/bunla.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Bánh mì nướng mật ong",
                    Description = "Bánh mì nướng giòn phết mật ong thơm lừng.",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/banhmi.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Khoai tây chiên",
                    Description = "Khoai tây chiên bơ tỏi giòn rụm.",
                    Price = 30000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/khoaitaychien.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Ngô chiên",
                    Description = "Ngô ngọt chiên bơ.",
                    Price = 30000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/ngochien.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Khoai lang kén",
                    Description = "Khoai lang kén vàng ươm, thơm mùi cốt dừa.",
                    Price = 30000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/khoailangken.jpg",
                    IsAvailable = true
                },
                new Product
                {
                    Name = "Kim chi",
                    Description = "Kim chi cải thảo muối cay.",
                    Price = 10000,
                    CategoryId = category.Id,
                    ImageUrl = "https://example.com/kimchi.jpg",
                    IsAvailable = true
                }
            };

            foreach (var p in sideDishes)
            {
                if (!await _context.Products.AnyAsync(x => x.Name == p.Name))
                {
                    _context.Products.Add(p);
                    Console.WriteLine($"✅ Added side dish '{p.Name}'");
                }
                else
                {
                    Console.WriteLine($"⏭️  Side dish '{p.Name}' already exists");
                }
            }

            await _context.SaveChangesAsync();
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
