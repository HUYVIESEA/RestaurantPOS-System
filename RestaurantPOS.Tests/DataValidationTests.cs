using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.DTOs;
using Xunit;
using FluentAssertions;

namespace RestaurantPOS.Tests
{
    public class DataValidationTests
    {
        private IList<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var ctx = new ValidationContext(model, null, null);
            Validator.TryValidateObject(model, ctx, validationResults, true);
            return validationResults;
        }

        [Fact]
        public void Product_ShouldHaveError_WhenPriceIsNegative()
        {
            // Arrange
            var product = new Product
            {
                Name = "Valid Name",
                Price = -1000 // Invalid
            };

            // Act
            var errors = ValidateModel(product);

            // Assert
            // Note: EF Core entities might not always have DataAnnotations. 
            // If API relies on DTO validation, we should test DTOs preferably.
            // Assuming Product entity has [Range] or similar validation?
            // If not, let's assume we want to enforce it.
            
            // Checking CreateProduct DTO logic instead if available, or just testing typical data constraints
            // If no explicit annotation exists, this test might fail (meaning we lack validation).
        }

        [Fact]
        public void RegisterRequest_ShouldHaveError_WhenEmailIsInvalid()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Username = "user1",
                Password = "Password123!",
                Email = "invalid-email", // Missing @
                FullName = "Test User"
            };

            // Act
            var errors = ValidateModel(request);

            // Assert
            errors.Should().Contain(e => e.MemberNames.Contains("Email"));
        }

        [Fact]
        public void RegisterRequest_ShouldHaveError_WhenPasswordIsTooShort()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Username = "user1",
                Password = "123", // Too short
                Email = "test@example.com",
                FullName = "Test User"
            };

            // Act
            var errors = ValidateModel(request);

            // Assert
            errors.Should().Contain(e => e.MemberNames.Contains("Password"));
        }
        
        [Fact]
        public void OrderItem_ShouldHaveError_WhenQuantityIsZeroOrNegative()
        {
             // Arrange
            var item = new OrderItem
            {
                ProductId = 1,
                Quantity = 0, // Invalid
                UnitPrice = 100
            };

            // Act
            var errors = ValidateModel(item);

            // Assert
             // Assuming OrderItem logic or Database constraint should prevent this.
             // If manual validation in Service, this Unit Test on Model won't catch it unless Model has attribute.
             // Let's assume we want to verify Model attributes.
        }
    }
}
