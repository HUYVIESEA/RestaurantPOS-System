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
    public class SupplierServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly SupplierService _supplierService;

        public SupplierServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            _supplierService = new SupplierService(_context);
        }

        [Fact]
        public async Task CreateSupplierAsync_ShouldAddSupplier_WhenValid()
        {
            // Arrange
            var supplier = new Supplier
            {
                Name = "Fresh Foods Co.",
                Phone = "0123456789",
                Email = "contact@freshfoods.com",
                Address = "123 Main St",
                ContactPerson = "John Doe"
            };

            // Act
            var result = await _supplierService.CreateSupplierAsync(supplier);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeGreaterThan(0);
            result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            result.IsActive.Should().BeTrue();

            var dbSupplier = await _context.Suppliers.FindAsync(result.Id);
            dbSupplier.Should().NotBeNull();
            dbSupplier!.Name.Should().Be("Fresh Foods Co.");
        }

        [Fact]
        public async Task UpdateSupplierAsync_ShouldModifyDetails_WhenSupplierExists()
        {
            // Arrange
            var supplier = new Supplier
            {
                Name = "Old Name",
                Phone = "1111111111",
                Email = "old@test.com"
            };
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            // Act
            supplier.Name = "New Name";
            supplier.Phone = "2222222222";
            var result = await _supplierService.UpdateSupplierAsync(supplier.Id, supplier);

            // Assert
            result.Should().NotBeNull();
            result!.Name.Should().Be("New Name");
            result.Phone.Should().Be("2222222222");
            result.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public async Task UpdateSupplierAsync_ShouldReturnNull_WhenSupplierNotFound()
        {
            // Act
            var result = await _supplierService.UpdateSupplierAsync(999, new Supplier());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeleteSupplierAsync_ShouldRemoveSupplier_WhenExists()
        {
            // Arrange
            var supplier = new Supplier { Name = "To Delete" };
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            // Act
            var result = await _supplierService.DeleteSupplierAsync(supplier.Id);

            // Assert
            result.Should().BeTrue();
            var dbSupplier = await _context.Suppliers.FindAsync(supplier.Id);
            dbSupplier.Should().BeNull();
        }

        [Fact]
        public async Task DeleteSupplierAsync_ShouldReturnFalse_WhenNotFound()
        {
            // Act
            var result = await _supplierService.DeleteSupplierAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task ToggleStatusAsync_ShouldFlipIsActive_WhenSupplierExists()
        {
            // Arrange
            var supplier = new Supplier { Name = "Toggle Test", IsActive = true };
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            // Act
            var result = await _supplierService.ToggleStatusAsync(supplier.Id);

            // Assert
            result.Should().BeTrue();
            var dbSupplier = await _context.Suppliers.FindAsync(supplier.Id);
            dbSupplier!.IsActive.Should().BeFalse();
        }

        [Fact]
        public async Task ToggleStatusAsync_ShouldReturnFalse_WhenNotFound()
        {
            // Act
            var result = await _supplierService.ToggleStatusAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task GetAllSuppliersAsync_ShouldReturnOrderedByName()
        {
            // Arrange
            _context.Suppliers.AddRange(
                new Supplier { Name = "Zebra Corp" },
                new Supplier { Name = "Alpha Inc" },
                new Supplier { Name = "Beta LLC" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = (await _supplierService.GetAllSuppliersAsync()).ToList();

            // Assert
            result.Should().HaveCount(3);
            result[0].Name.Should().Be("Alpha Inc");
            result[1].Name.Should().Be("Beta LLC");
            result[2].Name.Should().Be("Zebra Corp");
        }
    }
}
