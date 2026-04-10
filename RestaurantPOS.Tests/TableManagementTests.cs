using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using RestaurantPOS.API.Controllers;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;

namespace RestaurantPOS.Tests
{
    public class TableManagementTests
    {
        private readonly ApplicationDbContext _context;
        private readonly TablesController _controller;
        private readonly Mock<ITableService> _mockTableService;

        public TableManagementTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _mockTableService = new Mock<ITableService>();
            _controller = new TablesController(_mockTableService.Object);
        }

        [Fact]
        public async Task MergeTables_ShouldCombineTables_AndMarkAsOccupied()
        {
            var response = new MergeTablesResponse { GroupId = 123, TableNumbers = "T1,T2", TotalCapacity = 8, TableCount = 2 };
            _mockTableService.Setup(s => s.MergeTablesAsync(It.IsAny<List<int>>())).ReturnsAsync(response);

            var request = new MergeTablesRequest { TableIds = new List<int> { 1, 2 } };

            var result = await _controller.MergeTables(request);

            var actionResult = result.Result as OkObjectResult;
            actionResult.Should().NotBeNull();
            var value = actionResult!.Value as MergeTablesResponse;
            value.Should().NotBeNull();
            value.TableCount.Should().Be(2);
            value.TotalCapacity.Should().Be(8);
        }

        [Fact]
        public async Task SplitTables_ShouldRevertTables_ToAvailable()
        {
            _mockTableService.Setup(s => s.SplitTablesAsync(It.IsAny<int>())).ReturnsAsync(true);

            var result = await _controller.SplitTables(12345);

            var actionResult = result as OkObjectResult;
            actionResult.Should().NotBeNull();
        }

        [Fact]
        public async Task ReturnTable_ShouldFail_IfPendingOrdersExist()
        {
            _mockTableService.Setup(s => s.ReturnTableAsync(It.IsAny<int>()))
                .ThrowsAsync(new InvalidOperationException("Không thể trả bàn khi còn đơn hàng chưa hoàn thành"));

            var result = await _controller.ReturnTable(1);

            var badRequest = result as BadRequestObjectResult;
            badRequest.Should().NotBeNull();
            badRequest!.Value!.ToString()!.Should().Contain("còn đơn hàng chưa hoàn thành");
        }
        
        [Fact]
        public async Task ReturnTable_ShouldSucceed_IfNoOrders()
        {
            _mockTableService.Setup(s => s.ReturnTableAsync(It.IsAny<int>())).ReturnsAsync(true);
            
            var result = await _controller.ReturnTable(1);
            
            result.Should().BeOfType<NoContentResult>();
        }
    }
}
