using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Hubs;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;
using System.Collections.Generic;
using System.Linq;

namespace RestaurantPOS.Tests
{
    public class OrderServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<IHubContext<RestaurantHub>> _mockHubContext;
        private readonly Mock<IFirebaseService> _mockFirebaseService;
        private readonly Mock<ILogger<OrderService>> _mockLogger;
        private readonly OrderService _orderService;

        public OrderServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _mockHubContext = new Mock<IHubContext<RestaurantHub>>();
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();
            mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
            _mockHubContext.Setup(c => c.Clients).Returns(mockClients.Object);

            _mockFirebaseService = new Mock<IFirebaseService>();
            _mockLogger = new Mock<ILogger<OrderService>>();

            _orderService = new OrderService(_context, _mockHubContext.Object, _mockFirebaseService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldCalculateTotalCorrectly()
        {
            // Arrange
            var product = new Product { Id = 1, Name = "Coffee", Price = 30000, CategoryId = 1 };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var order = new Order
            {
                TableId = 1,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem { ProductId = 1, Quantity = 2 } // 2 * 30000 = 60000
                }
            };

            // Act
            var createdOrder = await _orderService.CreateOrderAsync(order);

            // Assert
            createdOrder.Should().NotBeNull();
            createdOrder.TotalAmount.Should().Be(60000);
        }

        [Fact]
        public async Task AddItemToOrderAsync_ShouldUpdateTotal_And_MergeItems()
        {
            // Arrange
            var product = new Product { Id = 1, Name = "Tea", Price = 20000, CategoryId = 1 };
            _context.Products.Add(product);
            
            var order = new Order { Id = 1, TotalAmount = 0 };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act 1: Add first item
            await _orderService.AddItemToOrderAsync(1, new OrderItem { ProductId = 1, Quantity = 1 });
            
            // Act 2: Add same item again
            var updatedOrder = await _orderService.AddItemToOrderAsync(1, new OrderItem { ProductId = 1, Quantity = 2 });

            // Assert
            updatedOrder.Should().NotBeNull();
            updatedOrder.OrderItems.Should().HaveCount(1); // Should merge
            updatedOrder.OrderItems.First().Quantity.Should().Be(3); // 1 + 2
            updatedOrder.TotalAmount.Should().Be(60000); // 3 * 20000
        }

        [Fact]
        public async Task CompleteOrderAsync_ShouldFreeTable_IfNoOtherOrders()
        {
            // Arrange
            var table = new Table { Id = 10, TableNumber = "T10", IsAvailable = false, OccupiedAt = DateTime.UtcNow };
            _context.Tables.Add(table);
            
            var order = new Order { Id = 100, TableId = 10, Status = "Processing", TotalAmount = 100000 };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act
            var completedOrder = await _orderService.CompleteOrderAsync(100, 100000, "Cash");

            // Assert
            completedOrder.Status.Should().Be("Completed");
            
            var tableInDb = await _context.Tables.FindAsync(10);
            tableInDb.IsAvailable.Should().BeTrue(); // Table should be freed
            tableInDb.OccupiedAt.Should().BeNull();
        }
        [Fact]
        public async Task UpdateItemQuantityAsync_ShouldRecalculateTotal()
        {
            // Arrange
            var product = new Product { Id = 1, Price = 10000 };
            _context.Products.Add(product);
            
            var orderItem = new OrderItem { Id = 1, ProductId = 1, Quantity = 2, UnitPrice = 10000 };
            var order = new Order { Id = 1, OrderItems = new List<OrderItem> { orderItem }, TotalAmount = 20000 };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.UpdateItemQuantityAsync(1, 1, 5); // Change qty 2 -> 5

            // Assert
            result.Should().NotBeNull();
            result.OrderItems!.First(i => i.Id == 1).Quantity.Should().Be(5);
            result.TotalAmount.Should().Be(50000); // 5 * 10000
        }

        [Fact]
        public async Task RemoveItemFromOrderAsync_ShouldCancelOrder_WhenLastItemRemoved()
        {
            // Arrange
            var table = new Table { Id = 1, IsAvailable = false, OccupiedAt = DateTime.UtcNow };
            _context.Tables.Add(table);

            var orderItem = new OrderItem { Id = 1, ProductId = 1, Quantity = 1, UnitPrice = 10000 };
            var order = new Order 
            { 
                Id = 1, 
                TableId = 1,
                Status = "Pending",
                OrderItems = new List<OrderItem> { orderItem }, 
                TotalAmount = 10000 
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.RemoveItemFromOrderAsync(1, 1);

            // Assert
            result.Should().NotBeNull();
            result.Status.Should().Be("Cancelled"); // Order cancelled
            
            var tableDb = await _context.Tables.FindAsync(1);
            tableDb.IsAvailable.Should().BeTrue(); // Table freed
        }

        [Fact]
        public async Task SplitOrderAsync_ShouldMoveItemsAndCreateNewOrder()
        {
            // Arrange
            var orderItems = new List<OrderItem> 
            {
                new OrderItem { Id = 1, ProductId = 1, Quantity = 2, UnitPrice = 10000 }, // Keep this
                new OrderItem { Id = 2, ProductId = 2, Quantity = 1, UnitPrice = 20000 }  // Move this
            };
            var order = new Order 
            { 
                Id = 1, TableId = 1, Status = "Pending", 
                OrderItems = orderItems, 
                TotalAmount = 40000 
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.SplitOrderAsync(1, new List<int> { 2 }); // Move Item ID 2

            // Assert
            result.Should().NotBeNull();
            
            // Check Original Order
            result.OriginalOrder.Id.Should().Be(1);
            result.OriginalOrder.TotalAmount.Should().Be(20000); // 40k - 20k
            
            // Check New Order
            result.NewOrder.Id.Should().NotBe(1);
            result.NewOrder.ParentOrderId.Should().Be(1);
            result.NewOrder.TotalAmount.Should().Be(20000);
            result.NewOrder.OrderItems!.Should().ContainSingle(i => i.Id == 2);
        }
    }
}
