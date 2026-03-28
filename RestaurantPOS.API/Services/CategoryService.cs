using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

/// <summary>
/// Category Service with Hybrid Caching for enterprise performance
/// </summary>
public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cache;
    private readonly ILogger<CategoryService> _logger;
    
    private const string CACHE_KEY_ALL_CATEGORIES = "categories:all";
    private const string CACHE_KEY_CATEGORY_PREFIX = "category:";
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromHours(1); // Categories change rarely

    public CategoryService(
        ApplicationDbContext context,
        ICacheService cache,
        ILogger<CategoryService> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
    {
        // Try cache first
        var cached = await _cache.GetAsync<List<Category>>(CACHE_KEY_ALL_CATEGORIES);
        if (cached != null)
        {
            _logger.LogInformation("All categories found in cache ({Count} items)", cached.Count);
            return cached;
        }

        // Cache miss - query database
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync();

        // Cache for 1 hour (categories rarely change)
        await _cache.SetAsync(CACHE_KEY_ALL_CATEGORIES, categories, CacheExpiration);
        _logger.LogInformation("Loaded {Count} categories from database and cached", categories.Count);

        return categories;
    }

    public async Task<Category?> GetCategoryByIdAsync(int id)
    {
        var cacheKey = $"{CACHE_KEY_CATEGORY_PREFIX}{id}";
        
        // Try cache first
        var cached = await _cache.GetAsync<Category>(cacheKey);
        if (cached != null)
        {
            _logger.LogInformation("Category {Id} found in cache", id);
            return cached;
        }

        // Cache miss - query database
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category != null)
        {
            await _cache.SetAsync(cacheKey, category, CacheExpiration);
        }

        return category;
    }

    public async Task<Category> CreateCategoryAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        // Invalidate all categories cache
        await InvalidateCategoryCache(category.Id);
        
        _logger.LogInformation("Created category {Id}: {Name}", category.Id, category.Name);

        return category;
    }

    public async Task<Category?> UpdateCategoryAsync(int id, Category category)
    {
        if (id != category.Id)
        {
            return null;
        }

        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
            
            // Invalidate caches
            await InvalidateCategoryCache(category.Id);
            
            _logger.LogInformation("Updated category {Id}: {Name}", category.Id, category.Name);
            
            return category;
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await CategoryExistsAsync(id))
            {
                return null;
            }
            throw;
        }
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return false;
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        // Invalidate caches
        await InvalidateCategoryCache(id);
        
        _logger.LogInformation("Deleted category {Id}: {Name}", id, category.Name);

        return true;
    }

    public async Task<bool> CategoryExistsAsync(int id)
    {
        return await _context.Categories.AnyAsync(e => e.Id == id);
    }

    /// <summary>
    /// Invalidates all cache entries related to a category
    /// </summary>
    private async Task InvalidateCategoryCache(int? categoryId = null)
    {
        var keysToRemove = new List<string>
        {
            CACHE_KEY_ALL_CATEGORIES // Always invalidate all categories list
        };

        if (categoryId.HasValue)
        {
            keysToRemove.Add($"{CACHE_KEY_CATEGORY_PREFIX}{categoryId.Value}");
        }

        foreach (var key in keysToRemove)
        {
            await _cache.RemoveAsync(key);
        }

        _logger.LogInformation("Invalidated {Count} category cache keys", keysToRemove.Count);
    }
}
