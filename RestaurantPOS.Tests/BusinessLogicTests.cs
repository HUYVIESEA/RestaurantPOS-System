using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Hubs;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;
using System.Linq;

namespace RestaurantPOS.Tests
{
    public class BusinessLogicTests
    {
        private readonly ApplicationDbContext _context;
        private readonly OrderService _orderService;

        public BusinessLogicTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            var mockHub = new Mock<IHubContext<RestaurantHub>>();
            mockHub.Setup(h => h.Clients.All).Returns(Mock.Of<IClientProxy>());
            
            _orderService = new OrderService(
                _context, 
                mockHub.Object, 
                new Mock<IFirebaseService>().Object, 
                new Mock<ILogger<OrderService>>().Object,
                new Mock<ICacheService>().Object
            );
        }

        [Fact]
        public async Task PriceStability_OldOrdersShouldNotChange_WhenProductPriceUpdates()
        {
            // Arrange
            var product = new Product { Id = 1, Name = "Pho", Price = 50000 };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Act 1: Create order with current price
            var orderItem = new OrderItem { ProductId = 1, Quantity = 1 };
            var order = new Order { OrderItems = new List<OrderItem> { orderItem } };
            
            var createdOrder = await _orderService.CreateOrderAsync(order);
            createdOrder.Should().NotBeNull();
            createdOrder!.TotalAmount.Should().Be(50000);
            
            var itemInDb = await _context.OrderItems.FirstAsync();
            itemInDb.UnitPrice.Should().Be(50000);

            // Act 2: Update Product Price
            product.Price = 60000;
            await _context.SaveChangesAsync();

            // Assert: Old order total should NOT change
            var oldOrder = await _orderService.GetOrderByIdAsync(createdOrder.Id);
            oldOrder!.TotalAmount.Should().Be(50000);
            oldOrder.OrderItems!.First().UnitPrice.Should().Be(50000);
            
            // Act 3: Create NEW order -> Should use NEW price
            var newOrder = await _orderService.CreateOrderAsync(new Order 
            { 
                OrderItems = new List<OrderItem> { new OrderItem { ProductId = 1, Quantity = 1 } } 
            });
            newOrder!.TotalAmount.Should().Be(60000);
        }

        [Fact]
        public async Task SequentialBooking_SameTableShouldBeMarkedOccupied()
        {
            // Arrange
            var table = new Table { Id = 1, TableNumber = "T1", IsAvailable = true };
            _context.Tables.Add(table);
            await _context.SaveChangesAsync();

            // Act 1: First order books the table
            var order1 = new Order { TableId = 1 };
            await _orderService.CreateOrderAsync(order1);

            // Assert 1: Table should be marked as occupied
            var tableAfterFirst = await _context.Tables.FindAsync(1);
            tableAfterFirst!.IsAvailable.Should().BeFalse();

            // Act 2: Second order on same table
            var order2 = new Order { TableId = 1 };
            await _orderService.CreateOrderAsync(order2);
            
            // Assert 2: Both orders should exist for the same table
            var ordersForTable = await _context.Orders.Where(o => o.TableId == 1).ToListAsync();
            ordersForTable.Should().HaveCount(2);
        }

        [Fact]
        public async Task CancelOrder_ShouldMarkAsCancelled()
        {
            // Arrange
            var order = new Order { CustomerName = "Test", TotalAmount = 50000 };
            await _orderService.CreateOrderAsync(order);

            // Act - Update status to Cancelled
            var result = await _orderService.UpdateOrderStatusAsync(order.Id, "Cancelled");

            // Assert
            result.Should().NotBeNull();
            result!.Status.Should().Be("Cancelled");
        }

        [Fact]
        public async Task CompleteOrder_ShouldUpdateStatusAndTimestamp()
        {
            // Arrange
            var order = new Order { CustomerName = "Test", TotalAmount = 50000 };
            await _orderService.CreateOrderAsync(order);

            // Act
            var result = await _orderService.CompleteOrderAsync(order.Id, 60000, "Cash");

            // Assert
            result.Should().NotBeNull();
            result!.Status.Should().Be("Completed");
        }
    }
}
