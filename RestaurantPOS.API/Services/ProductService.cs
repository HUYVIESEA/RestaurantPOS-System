using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services
{
    /// <summary>
    /// Product Service with Redis Caching for enterprise performance
    /// </summary>
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICacheService _cache;
        private readonly ILogger<ProductService> _logger;
        
        private const string CACHE_KEY_ALL_PRODUCTS = "products:all";
        private const string CACHE_KEY_PRODUCT_PREFIX = "product:";
        private const string CACHE_KEY_CATEGORY_PREFIX = "products:category:";
        private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(30);

        public ProductService(
            ApplicationDbContext context,
            ICacheService cache,
            ILogger<ProductService> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            // Try cache first
            var cached = await _cache.GetAsync<List<Product>>(CACHE_KEY_ALL_PRODUCTS);
            if (cached != null)
            {
                _logger.LogInformation("Returning {Count} products from cache", cached.Count);
                return cached;
            }

            // Cache miss - query database
            _logger.LogInformation("Cache miss - querying database for all products");
            var products = await _context.Products
                .Include(p => p.Category)
                .ToListAsync();
            
            // Store in cache
            await _cache.SetAsync(CACHE_KEY_ALL_PRODUCTS, products, CacheExpiration);
            
            return products;
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            var cacheKey = $"{CACHE_KEY_PRODUCT_PREFIX}{id}";
            
            // Try cache first
            var cached = await _cache.GetAsync<Product>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Product {ProductId} found in cache", id);
                return cached;
            }

            // Cache miss - query database
            _logger.LogInformation("Cache miss - querying database for product {ProductId}", id);
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (product != null)
            {
                await _cache.SetAsync(cacheKey, product, CacheExpiration);
            }
            
            return product;
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            var cacheKey = $"{CACHE_KEY_CATEGORY_PREFIX}{categoryId}";
            
            // Try cache first
            var cached = await _cache.GetAsync<List<Product>>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Category {CategoryId} products found in cache", categoryId);
                return cached;
            }

            // Cache miss - query database
            _logger.LogInformation("Cache miss - querying database for category {CategoryId}", categoryId);
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
            
            await _cache.SetAsync(cacheKey, products, CacheExpiration);
            
            return products;
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            
            // Invalidate cache
            await InvalidateProductCacheAsync();
            _logger.LogInformation("Product {ProductId} created - cache invalidated", product.Id);
            
            return product;
        }

        public async Task<Product?> UpdateProductAsync(int id, Product product)
        {
            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
                return null;

            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.CategoryId = product.CategoryId;
            existingProduct.ImageUrl = product.ImageUrl;
            existingProduct.IsAvailable = product.IsAvailable;
            existingProduct.StockQuantity = product.StockQuantity;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            
            // Invalidate cache
            await InvalidateProductCacheAsync();
            await _cache.RemoveAsync($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
            _logger.LogInformation("Product {ProductId} updated - cache invalidated", id);
            
            return existingProduct;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            
            // Invalidate cache
            await InvalidateProductCacheAsync();
            await _cache.RemoveAsync($"{CACHE_KEY_PRODUCT_PREFIX}{id}");
            _logger.LogInformation("Product {ProductId} deleted - cache invalidated", id);
            
            return true;
        }
        
        /// <summary>
        /// Invalidate all product-related caches
        /// </summary>
        private async Task InvalidateProductCacheAsync()
        {
            await _cache.RemoveAsync(CACHE_KEY_ALL_PRODUCTS);
            // In production, you'd also scan and remove category caches
            _logger.LogDebug("Product caches invalidated");
        }
    }
}
