using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.ProductService.Data;
using RestaurantPOS.ProductService.Models;
using RestaurantPOS.Shared.Models;

namespace RestaurantPOS.ProductService.Services;

public interface IProductService
{
    Task<PagedResult<Product>> GetProductsAsync(int page, int size, string? search = null);
    Task<IEnumerable<Product>> GetAllProductsAsync();
    Task<Product?> GetProductByIdAsync(int id);
    Task<IEnumerable<Category>> GetCategoriesAsync();
    Task<Product> CreateProductAsync(Product product);
    Task<Product?> UpdateProductAsync(int id, Product product);
    Task<bool> DeleteProductAsync(int id);
    Task<IEnumerable<Supplier>> GetAllSuppliersAsync();
    Task<Supplier> CreateSupplierAsync(Supplier supplier);
    Task<Supplier?> UpdateSupplierAsync(int id, Supplier supplier);
    Task<bool> DeleteSupplierAsync(int id);
}

public class ProductServiceImpl : IProductService
{
    private readonly ProductDbContext _context;
    private readonly IMemoryCache _cache;

    public ProductServiceImpl(ProductDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<PagedResult<Product>> GetProductsAsync(int page, int size, string? search = null)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || (p.Description != null && p.Description.Contains(search)));

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        return new PagedResult<Product>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = page,
            PageSize = size
        };
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        return await _cache.GetOrCreateAsync("all_products", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return await _context.Products
                .Include(p => p.Category)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }) ?? new List<Product>();
    }

    public async Task<Product?> GetProductByIdAsync(int id)
    {
        return await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Category>> GetCategoriesAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Product> CreateProductAsync(Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        _cache.Remove("all_products");
        return product;
    }

    public async Task<Product?> UpdateProductAsync(int id, Product product)
    {
        var existing = await _context.Products.FindAsync(id);
        if (existing == null) return null;

        existing.Name = product.Name;
        existing.Price = product.Price;
        existing.Description = product.Description;
        existing.ImageUrl = product.ImageUrl;
        existing.IsAvailable = product.IsAvailable;
        existing.StockQuantity = product.StockQuantity;
        existing.CategoryId = product.CategoryId;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _cache.Remove("all_products");
        return existing;
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        _cache.Remove("all_products");
        return true;
    }

    public async Task<IEnumerable<Supplier>> GetAllSuppliersAsync()
    {
        return await _context.Suppliers
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<Supplier> CreateSupplierAsync(Supplier supplier)
    {
        supplier.CreatedAt = DateTime.UtcNow;
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();
        return supplier;
    }

    public async Task<Supplier?> UpdateSupplierAsync(int id, Supplier supplier)
    {
        var existing = await _context.Suppliers.FindAsync(id);
        if (existing == null) return null;

        existing.Name = supplier.Name;
        existing.Phone = supplier.Phone;
        existing.Email = supplier.Email;
        existing.Address = supplier.Address;
        existing.ContactPerson = supplier.ContactPerson;
        existing.Notes = supplier.Notes;
        existing.IsActive = supplier.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteSupplierAsync(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return false;

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();
        return true;
    }
}
