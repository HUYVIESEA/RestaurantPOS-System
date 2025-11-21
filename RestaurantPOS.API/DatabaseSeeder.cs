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
