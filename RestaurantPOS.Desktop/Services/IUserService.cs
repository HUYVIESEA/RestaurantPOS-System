using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public interface IUserService
{
    Task<List<UserDto>> GetUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto?> CreateUserAsync(CreateUserRequest request);
    Task<bool> UpdateUserAsync(int id, UpdateUserRequest request);
    Task<bool> UpdateRoleAsync(int id, string role);
    Task<bool> UpdateStatusAsync(int id, bool isActive);
    Task<ResetPasswordResponse?> ResetPasswordAsync(int id);
    Task<bool> DeleteUserAsync(int id);
}
