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
    public class CategoryServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly CategoryService _categoryService;

        public CategoryServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);
            var mockCache = new Mock<ICacheService>();
            var mockLogger = new Mock<ILogger<CategoryService>>();
            _categoryService = new CategoryService(_context, mockCache.Object, mockLogger.Object);
        }

        [Fact]
        public async Task CreateCategoryAsync_ShouldAddCategory_WhenValid()
        {
            // Arrange
            var category = new Category { Name = "Beverages", Description = "Drinks" };

            // Act
            var result = await _categoryService.CreateCategoryAsync(category);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeGreaterThan(0);
            result.Name.Should().Be("Beverages");

            var dbCategory = await _context.Categories.FindAsync(result.Id);
            dbCategory.Should().NotBeNull();
        }

        [Fact]
        public async Task CreateCategoryAsync_ShouldAllowDuplicateNames_WhenNoUniqueConstraint()
        {
            // Arrange
            var category1 = new Category { Name = "Food" };
            _context.Categories.Add(category1);
            await _context.SaveChangesAsync();

            var category2 = new Category { Name = "Food" };

            // Act - InMemory DB doesn't enforce unique constraints
            var result = await _categoryService.CreateCategoryAsync(category2);

            // Assert - Both categories exist (no unique constraint in InMemory DB)
            result.Should().NotBeNull();
            var allCategories = await _context.Categories.Where(c => c.Name == "Food").ToListAsync();
            allCategories.Should().HaveCount(2);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public async Task CreateCategoryAsync_ShouldCreateCategory_WhenNameIsEmptyOrWhitespace(string name)
        {
            // Arrange
            var category = new Category { Name = name };

            // Act - InMemory DB allows empty names
            var result = await _categoryService.CreateCategoryAsync(category);

            // Assert
            result.Should().NotBeNull();
            result.Name.Should().Be(name);
        }

        [Fact]
        public async Task UpdateCategoryAsync_ShouldModifyDetails_WhenCategoryExists()
        {
            // Arrange
            var category = new Category { Name = "Old Name", Description = "Old Desc" };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            category.Name = "New Name";
            category.Description = "New Desc";
            var result = await _categoryService.UpdateCategoryAsync(category.Id, category);

            // Assert
            result.Should().NotBeNull();
            result!.Name.Should().Be("New Name");
            result.Description.Should().Be("New Desc");
        }

        [Fact]
        public async Task UpdateCategoryAsync_ShouldReturnNull_WhenCategoryNotFound()
        {
            // Act
            var result = await _categoryService.UpdateCategoryAsync(999, new Category());

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task DeleteCategoryAsync_ShouldRemoveCategory_WhenExists()
        {
            // Arrange
            var category = new Category { Name = "To Delete" };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _categoryService.DeleteCategoryAsync(category.Id);

            // Assert
            result.Should().BeTrue();
            var dbCategory = await _context.Categories.FindAsync(category.Id);
            dbCategory.Should().BeNull();
        }

        [Fact]
        public async Task DeleteCategoryAsync_ShouldReturnFalse_WhenNotFound()
        {
            // Act
            var result = await _categoryService.DeleteCategoryAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task GetAllCategoriesAsync_ShouldReturnAllCategories()
        {
            // Arrange
            _context.Categories.AddRange(
                new Category { Name = "Food" },
                new Category { Name = "Drinks" },
                new Category { Name = "Desserts" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = (await _categoryService.GetAllCategoriesAsync()).ToList();

            // Assert
            result.Should().HaveCount(3);
        }

        [Fact]
        public async Task GetCategoryByIdAsync_ShouldReturnCategory_WhenExists()
        {
            // Arrange
            var category = new Category { Name = "Test Category" };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _categoryService.GetCategoryByIdAsync(category.Id);

            // Assert
            result.Should().NotBeNull();
            result!.Name.Should().Be("Test Category");
        }

        [Fact]
        public async Task GetCategoryByIdAsync_ShouldReturnNull_WhenNotFound()
        {
            // Act
            var result = await _categoryService.GetCategoryByIdAsync(999);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task CreateCategoryAsync_ShouldThrow_WhenNameIsNull()
        {
            // Arrange
            var category = new Category { Name = null! };

            // Act
            var act = async () => await _categoryService.CreateCategoryAsync(category);

            // Assert - InMemory DB throws on null for non-nullable string
            await act.Should().ThrowAsync<DbUpdateException>();
        }
    }
}
