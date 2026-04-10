using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

public interface ISupplierService
{
    Task<IEnumerable<Supplier>> GetAllSuppliersAsync();
    Task<Supplier?> GetSupplierByIdAsync(int id);
    Task<Supplier> CreateSupplierAsync(Supplier supplier);
    Task<Supplier?> UpdateSupplierAsync(int id, Supplier supplier);
    Task<bool> DeleteSupplierAsync(int id);
    Task<bool> ToggleStatusAsync(int id);
}
