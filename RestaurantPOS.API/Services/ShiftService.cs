using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.DTOs;

namespace RestaurantPOS.API.Services
{
    public class ShiftService : IShiftService
    {
        private readonly ApplicationDbContext _context;

        public ShiftService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ShiftDto> StartShiftAsync(int userId, CreateShiftDto dto)
        {
            // Check if user already has an active shift
            var activeShift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "Active");

            if (activeShift != null)
            {
                throw new InvalidOperationException("User already has an active shift.");
            }

            var shift = new Shift
            {
                UserId = userId,
                StartTime = DateTime.UtcNow,
                StartingCash = dto.StartingCash,
                Status = "Active",
                Notes = dto.Notes
            };

            _context.Shifts.Add(shift);
            await _context.SaveChangesAsync();

            return await GetShiftByIdAsync(shift.Id) ?? throw new Exception("Failed to retrieve created shift");
        }

        public async Task<ShiftDto> CloseShiftAsync(int userId, CloseShiftDto dto)
        {
            var activeShift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "Active");

            if (activeShift == null)
            {
                throw new InvalidOperationException("No active shift found for this user.");
            }

            // Calculate Expected Cash
            // 1. Get all completed orders within shift time paid by cash
            var cashPayments = await _context.Payments
                .Where(p => p.PaymentDate >= activeShift.StartTime && 
                            p.Method == "Cash" && 
                            p.Status == "Success")
                .SumAsync(p => p.Amount);

            activeShift.ExpectedCash = activeShift.StartingCash + cashPayments;
            activeShift.EndingCash = dto.EndingCash;
            activeShift.EndTime = DateTime.UtcNow;
            activeShift.Status = "Closed";
            
            if (!string.IsNullOrEmpty(dto.Notes))
            {
                activeShift.Notes = string.IsNullOrEmpty(activeShift.Notes) 
                    ? dto.Notes 
                    : $"{activeShift.Notes} | Close Notes: {dto.Notes}";
            }

            await _context.SaveChangesAsync();

            return await GetShiftByIdAsync(activeShift.Id) ?? throw new Exception("Failed to retrieve closed shift");
        }

        public async Task<ShiftDto?> GetActiveShiftAsync(int userId)
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "Active");

            return shift != null ? MapToDto(shift) : null;
        }

        public async Task<ShiftDto?> GetShiftByIdAsync(int id)
        {
            var shift = await _context.Shifts
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            return shift != null ? MapToDto(shift) : null;
        }

        public async Task<IEnumerable<ShiftDto>> GetShiftsAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Shifts.Include(s => s.User).AsQueryable();

            if (startDate.HasValue)
                query = query.Where(s => s.StartTime >= startDate.Value);
            
            if (endDate.HasValue)
                query = query.Where(s => s.StartTime <= endDate.Value);

            var shifts = await query.OrderByDescending(s => s.StartTime).ToListAsync();
            return shifts.Select(MapToDto);
        }

        private static ShiftDto MapToDto(Shift shift)
        {
            return new ShiftDto
            {
                Id = shift.Id,
                UserId = shift.UserId,
                UserName = shift.User?.Username,
                FullName = shift.User?.FullName,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                StartingCash = shift.StartingCash,
                EndingCash = shift.EndingCash,
                ExpectedCash = shift.ExpectedCash,
                Status = shift.Status,
                Notes = shift.Notes
            };
        }
    }
}