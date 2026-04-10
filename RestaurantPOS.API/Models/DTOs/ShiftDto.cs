namespace RestaurantPOS.API.Models.DTOs
{
    public class ShiftDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal StartingCash { get; set; }
        public decimal? EndingCash { get; set; }
        public decimal? ExpectedCash { get; set; }
        public string Status { get; set; } = "Active";
        public string? Notes { get; set; }
    }

    public class CreateShiftDto
    {
        public decimal StartingCash { get; set; }
        public string? Notes { get; set; }
    }

    public class CloseShiftDto
    {
        public decimal EndingCash { get; set; }
        public string? Notes { get; set; }
    }
}