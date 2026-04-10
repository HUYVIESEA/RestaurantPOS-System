using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;
using Xunit;
using FluentAssertions;
using System.Linq;

namespace RestaurantPOS.Tests
{
    public class ProductServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly ProductService _productService;

        public ProductServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            var mockCache = new Mock<ICacheService>();
            _productService = new ProductService(_context, mockCache.Object, new Microsoft.Extensions.Logging.Abstractions.NullLogger<ProductService>());
        }

        [Fact]
        public async Task CreateProductAsync_ShouldAddProduct_WhenValid()
        {
            // Arrange
            var category = new Category { Name = "Food" };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var newProduct = new Product 
            { 
                Name = "New Burger", 
                Price = 50000, 
                CategoryId = category.Id, 
                ImageUrl = "http://test.com/img.jpg" 
            };

            // Act
            var createdProduct = await _productService.CreateProductAsync(newProduct);

            // Assert
            createdProduct.Should().NotBeNull();
            createdProduct.Id.Should().NotBe(0);
            
            var dbProduct = await _context.Products.FindAsync(createdProduct.Id);
            dbProduct.Should().NotBeNull();
            dbProduct.Name.Should().Be("New Burger");
        }

        [Fact]
        public async Task UpdateProductAsync_ShouldModifyDetails()
        {
            // Arrange
            var product = new Product { Name = "Old Name", Price = 10000, IsAvailable = true };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Act
            product.Name = "New Name";
            product.Price = 20000;
            var result = await _productService.UpdateProductAsync(product.Id, product);

            // Assert
            result.Should().NotBeNull();

            var dbProduct = await _context.Products.FindAsync(product.Id);
            dbProduct!.Name.Should().Be("New Name");
            dbProduct.Price.Should().Be(20000);
        }

        [Fact]
        public async Task DeleteProductAsync_ShouldRemoveProduct()
        {
            // Arrange
            var product = new Product { Name = "To Delete", Price = 10000 };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productService.DeleteProductAsync(product.Id);

            // Assert
            result.Should().BeTrue();
            
            var dbProduct = await _context.Products.FindAsync(product.Id);
            dbProduct.Should().BeNull();
        }

        [Fact]
        public async Task DeleteProductAsync_ShouldRemoveProduct_WhenNoOrders()
        {
            // Arrange
            var product = new Product { Name = "To Delete", Price = 10000 };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productService.DeleteProductAsync(product.Id);

            // Assert
            result.Should().BeTrue();
            
            var dbProduct = await _context.Products.FindAsync(product.Id);
            dbProduct.Should().BeNull();
        }


    }
}
