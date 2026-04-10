using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.DTOs;

namespace RestaurantPOS.API.Services
{
    public interface IShiftService
    {
        Task<ShiftDto> StartShiftAsync(int userId, CreateShiftDto dto);
        Task<ShiftDto> CloseShiftAsync(int userId, CloseShiftDto dto);
        Task<ShiftDto?> GetActiveShiftAsync(int userId);
        Task<IEnumerable<ShiftDto>> GetShiftsAsync(DateTime? startDate, DateTime? endDate);
        Task<ShiftDto?> GetShiftByIdAsync(int id);
    }
}