using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Scripts
{
    /// <summary>
    /// Script to seed Manager role users into the database
    /// Run this once to add Manager users
    /// </summary>
    public class SeedManagerUsers
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            Console.WriteLine("========================================");
            Console.WriteLine("Seeding Manager Role Users");
            Console.WriteLine("========================================");

            // Check if Manager user already exists
            var existingManager = await context.Users
                .FirstOrDefaultAsync(u => u.Username == "manager");

            if (existingManager != null)
            {
                Console.WriteLine("Manager user already exists. Skipping...");
                return;
            }

            // Create Manager user
            var managerUser = new User
            {
                Username = "manager",
                Email = "manager@restaurantpos.com",
                // Password: Manager@123
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123"),
                FullName = "Quản lý nhà hàng",
                PhoneNumber = "0987654321",
                Role = "Manager",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(managerUser);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Manager user created successfully!");
            Console.WriteLine($"   Username: {managerUser.Username}");
            Console.WriteLine($"   Email: {managerUser.Email}");
            Console.WriteLine($"   Password: Manager@123");
            Console.WriteLine($"   Role: {managerUser.Role}");
            Console.WriteLine("========================================");
        }

        public static async Task DisplayUserStatistics(ApplicationDbContext context)
        {
            Console.WriteLine();
            Console.WriteLine("========================================");
            Console.WriteLine("User Statistics by Role");
            Console.WriteLine("========================================");

            var userStats = await context.Users
                .GroupBy(u => u.Role)
                .Select(g => new
                {
                    Role = g.Key,
                    TotalUsers = g.Count(),
                    ActiveUsers = g.Count(u => u.IsActive),
                    InactiveUsers = g.Count(u => !u.IsActive)
                })
                .OrderBy(s => s.Role == "Admin" ? 1 : s.Role == "Manager" ? 2 : 3)
                .ToListAsync();

            foreach (var stat in userStats)
            {
                Console.WriteLine($"{stat.Role,-10} Total: {stat.TotalUsers,3}  Active: {stat.ActiveUsers,3}  Inactive: {stat.InactiveUsers,3}");
            }

            Console.WriteLine("========================================");

            // Validation
            var hasAdmin = userStats.Any(s => s.Role == "Admin");
            var hasManager = userStats.Any(s => s.Role == "Manager");
            var hasStaff = userStats.Any(s => s.Role == "Staff");

            if (hasAdmin && hasManager && hasStaff)
            {
                Console.WriteLine("✅ SUCCESS: All three roles are present!");
            }
            else
            {
                Console.WriteLine("⚠️ WARNING: Not all roles are present:");
                if (!hasAdmin) Console.WriteLine("   - Missing Admin role");
                if (!hasManager) Console.WriteLine("   - Missing Manager role");
                if (!hasStaff) Console.WriteLine("   - Missing Staff role");
            }

            Console.WriteLine("========================================");
        }

        public static async Task ListAllUsers(ApplicationDbContext context)
        {
            Console.WriteLine();
            Console.WriteLine("========================================");
            Console.WriteLine("All Users in Database");
            Console.WriteLine("========================================");

            var users = await context.Users
                .OrderBy(u => u.Role == "Admin" ? 1 : u.Role == "Manager" ? 2 : 3)
                .ThenBy(u => u.CreatedAt)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.FullName,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            Console.WriteLine($"{"ID",-5} {"Username",-15} {"Email",-30} {"Role",-10} {"Active",-8} {"Created"}");
            Console.WriteLine(new string('-', 100));

            foreach (var user in users)
            {
                Console.WriteLine($"{user.Id,-5} {user.Username,-15} {user.Email,-30} {user.Role,-10} {(user.IsActive ? "Yes" : "No"),-8} {user.CreatedAt:yyyy-MM-dd}");
            }

            Console.WriteLine("========================================");
        }
    }
}
