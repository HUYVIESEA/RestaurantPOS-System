using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto?> CreateCategoryAsync(CategoryDto category);
    Task<bool> UpdateCategoryAsync(CategoryDto category);
    Task<bool> DeleteCategoryAsync(int id);
}
