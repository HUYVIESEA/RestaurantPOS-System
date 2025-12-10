using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;
using System.Collections.Generic;
using System.Linq;

namespace RestaurantPOS.Tests
{
    public class ReportServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly ReportService _reportService;

        public ReportServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _reportService = new ReportService(_context);
        }

        [Fact]
        public async Task GetRevenueReportAsync_ShouldAggregateCorrectly()
        {
            // Arrange
            var today = DateTime.UtcNow.Date;
            
            // Order 1: Completed Today - 100k
            _context.Orders.Add(new Order { Id = 1, OrderDate = today.AddHours(10), TotalAmount = 100000, Status = "Completed" });
            
            // Order 2: Completed Today - 200k
            _context.Orders.Add(new Order { Id = 2, OrderDate = today.AddHours(12), TotalAmount = 200000, Status = "Completed" });
            
            // Order 3: Cancelled Today - 500k (Should be ignored)
            _context.Orders.Add(new Order { Id = 3, OrderDate = today.AddHours(14), TotalAmount = 500000, Status = "Cancelled" });

            // Order 4: Completed Yesterday - 50k (Should be ignored)
            _context.Orders.Add(new Order { Id = 4, OrderDate = today.AddDays(-1), TotalAmount = 50000, Status = "Completed" });

            await _context.SaveChangesAsync();

            // Act
            var report = await _reportService.GetRevenueReportAsync(today, today.AddHours(23));

            // Assert
            report.Should().NotBeNull();
            report.TotalRevenue.Should().Be(300000); // 100k + 200k
            report.TotalOrders.Should().Be(2);
            report.AverageOrderValue.Should().Be(150000); // 300k / 2
        }

        [Fact]
        public async Task GetTopSellingProductsAsync_ShouldReturnTopItems()
        {
            // Arrange
            var today = DateTime.UtcNow.Date;
            
            var category = new Category { Id = 1, Name = "Drinks" };
            var p1 = new Product { Id = 1, Name = "Coffee", Category = category };
            var p2 = new Product { Id = 2, Name = "Tea", Category = category };
            _context.Categories.Add(category);
            _context.Products.AddRange(p1, p2);

            var order = new Order { Id = 1, OrderDate = today, Status = "Completed" };
            _context.Orders.Add(order);

            // Item 1: Coffee x 10
            _context.OrderItems.Add(new OrderItem { OrderId = 1, ProductId = 1, Quantity = 10, UnitPrice = 10, Product = p1, Order = order });
            // Item 2: Tea x 5
            _context.OrderItems.Add(new OrderItem { OrderId = 1, ProductId = 2, Quantity = 5, UnitPrice = 10, Product = p2, Order = order });
            
            await _context.SaveChangesAsync();

            // Act
            var topProducts = await _reportService.GetTopSellingProductsAsync(today, today.AddHours(23));

            // Assert
            topProducts.Should().HaveCount(2);
            topProducts[0].ProductName.Should().Be("Coffee");
            topProducts[0].TotalQuantitySold.Should().Be(10);
            
            topProducts[1].ProductName.Should().Be("Tea");
            topProducts[1].TotalQuantitySold.Should().Be(5);
        }
    }
}
