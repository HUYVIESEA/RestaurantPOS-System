using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Microsoft.Extensions.Logging;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;
using System.Linq;

namespace RestaurantPOS.Tests
{
    public class DeviceServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly DeviceService _deviceService;

        public DeviceServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _deviceService = new DeviceService(_context);
        }

        [Fact]
        public async Task RequestConnectionAsync_ShouldCreateNewDevice_WhenDeviceNotExists()
        {
            // Arrange
            var device = new PosDevice
            {
                Name = "POS-01",
                IpAddress = "192.168.1.10",
                Type = "Mobile",
                DeviceIdentifier = "device-001",
                ConnectionType = "LAN"
            };

            // Act
            var result = await _deviceService.RequestConnectionAsync(device);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().NotBe(Guid.Empty);
            result.Status.Should().Be("Pending");
            result.RequestTime.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task RequestConnectionAsync_ShouldUpdateExistingDevice_WhenDeviceExists()
        {
            // Arrange
            var existingDevice = new PosDevice
            {
                Id = Guid.NewGuid(),
                DeviceIdentifier = "device-002",
                Name = "Old Name",
                IpAddress = "192.168.1.20",
                ConnectionType = "LAN",
                Status = "Pending"
            };
            _context.PosDevices.Add(existingDevice);
            await _context.SaveChangesAsync();

            var updatedDevice = new PosDevice
            {
                DeviceIdentifier = "device-002",
                Name = "New Name",
                IpAddress = "192.168.1.30",
                ConnectionType = "Internet"
            };

            // Act
            var result = await _deviceService.RequestConnectionAsync(updatedDevice);

            // Assert
            result.Id.Should().Be(existingDevice.Id);
            result.Name.Should().Be("New Name");
            result.IpAddress.Should().Be("192.168.1.30");
        }

        [Fact]
        public async Task ApproveDeviceAsync_ShouldSetActiveStatus_WhenDeviceExists()
        {
            // Arrange
            var device = new PosDevice
            {
                DeviceIdentifier = "device-003",
                Name = "POS-03",
                Status = "Pending"
            };
            _context.PosDevices.Add(device);
            await _context.SaveChangesAsync();

            // Act
            var result = await _deviceService.ApproveDeviceAsync(device.Id);

            // Assert
            result.Status.Should().Be("Active");
            result.LastConnected.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task ApproveDeviceAsync_ShouldThrow_WhenDeviceNotFound()
        {
            // Act
            var act = async () => await _deviceService.ApproveDeviceAsync(Guid.NewGuid());

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task RejectDeviceAsync_ShouldRemoveDevice_WhenDeviceExists()
        {
            // Arrange
            var device = new PosDevice
            {
                DeviceIdentifier = "device-004",
                Name = "POS-04",
                Status = "Pending"
            };
            _context.PosDevices.Add(device);
            await _context.SaveChangesAsync();

            // Act
            var result = await _deviceService.RejectDeviceAsync(device.Id);

            // Assert
            result.Should().BeTrue();
            var dbDevice = await _context.PosDevices.FindAsync(device.Id);
            dbDevice.Should().BeNull();
        }

        [Fact]
        public async Task RejectDeviceAsync_ShouldReturnFalse_WhenDeviceNotFound()
        {
            // Act
            var result = await _deviceService.RejectDeviceAsync(Guid.NewGuid());

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void GetStoreCode_ShouldReturnValidCode()
        {
            // Act
            var result = _deviceService.GetStoreCode();

            // Assert
            result.Should().NotBeNull();
            var code = result.GetType().GetProperty("Code")!.GetValue(result);
            code.Should().NotBeNull();
            code.ToString().Should().HaveLength(6);
        }

        [Fact]
        public async Task GetAllDevicesAsync_ShouldReturnOrderedByRequestTime()
        {
            // Arrange
            _context.PosDevices.AddRange(
                new PosDevice { DeviceIdentifier = "d1", Name = "D1", RequestTime = DateTime.UtcNow.AddMinutes(-10) },
                new PosDevice { DeviceIdentifier = "d2", Name = "D2", RequestTime = DateTime.UtcNow }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = (await _deviceService.GetAllDevicesAsync()).ToList();

            // Assert
            result.Should().HaveCount(2);
            result[0].DeviceIdentifier.Should().Be("d2");
        }
    }
}
