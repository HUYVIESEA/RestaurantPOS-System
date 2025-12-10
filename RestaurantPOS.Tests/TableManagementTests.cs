using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Controllers;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using Xunit;
using FluentAssertions;

namespace RestaurantPOS.Tests
{
    public class TableManagementTests
    {
        private readonly ApplicationDbContext _context;
        private readonly TablesController _controller;

        public TableManagementTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _controller = new TablesController(_context);
        }

        [Fact]
        public async Task MergeTables_ShouldCombineTables_AndMarkAsOccupied()
        {
            // Arrange
            var t1 = new Table { Id = 1, TableNumber = "T1", IsAvailable = true, Capacity = 4 };
            var t2 = new Table { Id = 2, TableNumber = "T2", IsAvailable = true, Capacity = 4 };
            _context.Tables.AddRange(t1, t2);
            await _context.SaveChangesAsync();

            var request = new MergeTablesRequest { TableIds = new List<int> { 1, 2 } };

            // Act
            var result = await _controller.MergeTables(request);

            // Assert
            var actionResult = result.Result as OkObjectResult;
            actionResult.Should().NotBeNull();
            
            var response = actionResult!.Value as MergeTablesResponse;
            response.Should().NotBeNull();
            response.TableCount.Should().Be(2);
            response.TotalCapacity.Should().Be(8);

            // Verify DB state
            var dbT1 = await _context.Tables.FindAsync(1);
            var dbT2 = await _context.Tables.FindAsync(2);
            
            dbT1.IsMerged.Should().BeTrue();
            dbT2.IsMerged.Should().BeTrue();
            dbT1.MergedGroupId.Should().Be(dbT2.MergedGroupId);
            dbT1.IsAvailable.Should().BeFalse(); // Merged tables are marked occupied/unavailable for individual booking
        }

        [Fact]
        public async Task SplitTables_ShouldRevertTables_ToAvailable()
        {
            // Arrange
            int groupId = 12345;
            var t1 = new Table { Id = 1, IsMerged = true, MergedGroupId = groupId, IsAvailable = false };
            var t2 = new Table { Id = 2, IsMerged = true, MergedGroupId = groupId, IsAvailable = false };
            _context.Tables.AddRange(t1, t2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.SplitTables(groupId);

            // Assert
            var actionResult = result as OkObjectResult;
            actionResult.Should().NotBeNull();

            var dbT1 = await _context.Tables.FindAsync(1);
            dbT1!.IsMerged.Should().BeFalse();
            dbT1.MergedGroupId.Should().BeNull();
            dbT1.IsAvailable.Should().BeTrue();
        }

        [Fact]
        public async Task ReturnTable_ShouldFail_IfPendingOrdersExist()
        {
            // Arrange
            var table = new Table { Id = 1, IsAvailable = false };
            _context.Tables.Add(table);
            
            var order = new Order { Id = 1, TableId = 1, Status = "Pending" }; // Pending order
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.ReturnTable(1);

            // Assert
            var badRequest = result as BadRequestObjectResult;
            badRequest.Should().NotBeNull();
            badRequest!.Value!.ToString()!.Should().Contain("còn đơn hàng chưa hoàn thành");
        }
        
        [Fact]
        public async Task ReturnTable_ShouldSucceed_IfNoOrders()
        {
             // Arrange
            var table = new Table { Id = 1, IsAvailable = false, OccupiedAt = DateTime.UtcNow };
            _context.Tables.Add(table);
            await _context.SaveChangesAsync();
            
            // Act
            var result = await _controller.ReturnTable(1);
            
            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            var dbTable = await _context.Tables.FindAsync(1);
            dbTable.Should().NotBeNull();
            dbTable!.IsAvailable.Should().BeTrue();
            dbTable.OccupiedAt.Should().BeNull();
        }
    }
}
