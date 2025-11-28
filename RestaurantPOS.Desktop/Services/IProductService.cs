using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public interface IProductService
{
    Task<List<CategoryDto>> GetCategoriesAsync();
    Task<List<ProductDto>> GetProductsAsync();
    Task<List<ProductDto>> GetProductsByCategoryAsync(int categoryId);
}
