using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;
using System.Linq;

namespace RestaurantPOS.Tests
{
    public class PaymentSettingsServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly PaymentSettingsService _paymentSettingsService;

        public PaymentSettingsServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _paymentSettingsService = new PaymentSettingsService(_context);
        }

        [Fact]
        public async Task GetSettingsAsync_ShouldReturnNotConfigured_WhenNoSettingsExist()
        {
            // Act
            var result = await _paymentSettingsService.GetSettingsAsync();

            // Assert
            result.Should().NotBeNull();
            var isConfigured = result.GetType().GetProperty("isConfigured")!.GetValue(result);
            isConfigured.Should().Be(false);
        }

        [Fact]
        public async Task GetSettingsAsync_ShouldReturnSettings_WhenActiveSettingsExist()
        {
            // Arrange
            _context.PaymentSettings.Add(new PaymentSettings
            {
                BankName = "Test Bank",
                BankBin = "970418",
                AccountNumber = "1234567890",
                AccountName = "Test Account",
                IsActive = true
            });
            await _context.SaveChangesAsync();

            // Act
            var result = await _paymentSettingsService.GetSettingsAsync();

            // Assert
            var isConfigured = result.GetType().GetProperty("isConfigured")!.GetValue(result);
            isConfigured.Should().Be(true);
            var bankName = result.GetType().GetProperty("bankName")!.GetValue(result);
            bankName.Should().Be("Test Bank");
        }

        [Fact]
        public async Task UpdateSettingsAsync_ShouldCreateNewSettings_WhenValidCredentials()
        {
            // Arrange
            var user = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Email = "admin@test.com",
                FullName = "Admin User",
                Role = "Admin",
                IsActive = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _paymentSettingsService.UpdateSettingsAsync(
                "MB Bank", "970422", "0123456789", "Test Account", "Admin123!", user.Id);

            // Assert
            var success = result.GetType().GetProperty("success")!.GetValue(result);
            success.Should().Be(true);

            var dbSettings = await _context.PaymentSettings.FirstOrDefaultAsync();
            dbSettings.Should().NotBeNull();
            dbSettings!.BankName.Should().Be("MB Bank");
            dbSettings.AccountNumber.Should().Be("0123456789");
        }

        [Fact]
        public async Task UpdateSettingsAsync_ShouldThrow_WhenPasswordIsIncorrect()
        {
            // Arrange
            var user = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
                Email = "admin@test.com",
                FullName = "Admin User",
                Role = "Admin",
                IsActive = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var act = async () => await _paymentSettingsService.UpdateSettingsAsync(
                "MB Bank", "970422", "0123456789", "Test Account", "WrongPassword", user.Id);

            // Assert
            await act.Should().ThrowAsync<UnauthorizedAccessException>()
                .WithMessage("*Mật khẩu không chính xác*");
        }

        [Fact]
        public async Task UpdateSettingsAsync_ShouldThrow_WhenUserNotFound()
        {
            // Act
            var act = async () => await _paymentSettingsService.UpdateSettingsAsync(
                "MB Bank", "970422", "0123456789", "Test Account", "AnyPassword", 999);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("*Không tìm thấy người dùng*");
        }

        [Fact]
        public async Task UpdateSettingsAsync_ShouldDeactivateOldSettings_WhenCreatingNew()
        {
            // Arrange
            var user = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Email = "admin@test.com",
                FullName = "Admin User",
                Role = "Admin",
                IsActive = true
            };
            _context.Users.Add(user);
            _context.PaymentSettings.Add(new PaymentSettings
            {
                BankName = "Old Bank",
                BankBin = "970400",
                AccountNumber = "0000000000",
                AccountName = "Old Account",
                IsActive = true
            });
            await _context.SaveChangesAsync();

            // Act
            await _paymentSettingsService.UpdateSettingsAsync(
                "New Bank", "970422", "1111111111", "New Account", "Admin123!", user.Id);

            // Assert
            var oldSettings = await _context.PaymentSettings
                .Where(s => s.BankName == "Old Bank").ToListAsync();
            oldSettings.Should().AllSatisfy(s => s.IsActive.Should().BeFalse());

            var newSettings = await _context.PaymentSettings
                .Where(s => s.BankName == "New Bank").ToListAsync();
            newSettings.Should().AllSatisfy(s => s.IsActive.Should().BeTrue());
        }
    }
}
