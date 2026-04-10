using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.DTOs;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;
using System.Collections.Generic;

namespace RestaurantPOS.Tests
{
    public class AuthServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            // Setup In-Memory Database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB per test
                .Options;
            _context = new ApplicationDbContext(options);

            // Mock dependencies
            var inMemorySettings = new Dictionary<string, string>
            {
                {"JwtSettings:SecretKey", "ThisIsAVeryLongSecretKeyForTestingPurposeOnly123!"},
                {"JwtSettings:Issuer", "TestIssuer"},
                {"JwtSettings:Audience", "TestAudience"},
                {"JwtSettings:ExpiryInHours", "24"}
            };
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();
            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(x => x.GetSection(It.IsAny<string>()))
                .Returns((string key) => configuration.GetSection(key));
            _mockConfig.Setup(x => x[It.IsAny<string>()])
                .Returns((string key) => configuration[key]);

            _mockEmailService = new Mock<IEmailService>();

            _authService = new AuthService(_context, _mockConfig.Object, _mockEmailService.Object);
        }

        [Fact]
        public async Task RegisterAsync_ShouldCreateUser_WhenValidRequest()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Username = "testuser",
                Password = "Password123!",
                Email = "test@example.com",
                FullName = "Test User",
                Role = "Staff"
            };

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.Should().NotBeNull();
            result.Username.Should().Be(request.Username);
            
            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Username == "testuser");
            userInDb.Should().NotBeNull();
            // Verify Password is Hashed (not plain text)
            userInDb.PasswordHash.Should().NotBe("Password123!");
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnToken_WhenCredentialsAreCorrect()
        {
            // Arrange
            var password = "Password123!";
            var user = new User
            {
                Username = "loginuser",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Email = "login@example.com",
                FullName = "Login User",
                Role = "Staff",
                IsActive = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginRequest = new LoginRequest { Username = "loginuser", Password = password };

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            result.Should().NotBeNull();
            result!.Token.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnNull_WhenPasswordIsWrong()
        {
            // Arrange
            var user = new User
            {
                Username = "wrongpassuser",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword"),
                Email = "wrong@example.com",
                FullName = "Wrong Pass User",
                Role = "Staff",
                IsActive = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginRequest = new LoginRequest { Username = "wrongpassuser", Password = "WrongPassword" };

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            result.Should().BeNull();
        }
    }
}
