using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public interface IProductService
{
    Task<List<CategoryDto>> GetCategoriesAsync();
    Task<List<ProductDto>> GetProductsAsync();
    Task<List<ProductDto>> GetProductsByCategoryAsync(int categoryId);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto?> CreateProductAsync(ProductDto product);
    Task<bool> UpdateProductAsync(ProductDto product);
    Task<bool> DeleteProductAsync(int id);
}
