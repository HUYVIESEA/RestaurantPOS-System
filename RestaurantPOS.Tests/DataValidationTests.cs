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
        public void Product_ShouldHaveError_WhenNameIsEmpty()
        {
            // Arrange
            var product = new Product
            {
                Name = "",
                Price = 10000
            };

            // Act
            var errors = ValidateModel(product);

            // Assert
            errors.Should().Contain(e => e.MemberNames.Contains("Name"));
        }

        [Fact]
        public void Product_ShouldHaveError_WhenPriceIsNegative()
        {
            // Arrange
            var product = new Product
            {
                Name = "Valid Name",
                Price = -1000
            };

            // Act
            var errors = ValidateModel(product);

            // Assert
            errors.Should().Contain(e => e.MemberNames.Contains("Price"));
        }

        [Fact]
        public void RegisterRequest_ShouldHaveError_WhenEmailIsInvalid()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Username = "user1",
                Password = "Password123!",
                Email = "invalid-email",
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
                Password = "123",
                Email = "test@example.com",
                FullName = "Test User"
            };

            // Act
            var errors = ValidateModel(request);

            // Assert
            errors.Should().Contain(e => e.MemberNames.Contains("Password"));
        }
        
        [Fact]
        public void OrderItem_ShouldHaveError_WhenQuantityIsZero()
        {
             // Arrange
            var item = new OrderItem
            {
                ProductId = 1,
                Quantity = 0,
                UnitPrice = 100
            };

            // Act
            var errors = ValidateModel(item);

            // Assert
            errors.Should().Contain(e => e.MemberNames.Contains("Quantity"));
        }

        [Fact]
        public void OrderItem_ShouldHaveError_WhenQuantityIsNegative()
        {
             // Arrange
            var item = new OrderItem
            {
                ProductId = 1,
                Quantity = -5,
                UnitPrice = 100
            };

            // Act
            var errors = ValidateModel(item);

            // Assert
            errors.Should().Contain(e => e.MemberNames.Contains("Quantity"));
        }
    }
}
