namespace RestaurantPOS.API.Services.VietQR
{
    public interface IVietQRService
    {
        Task<List<BankInfo>> GetBanksAsync();
        string GenerateQRUrl(string bankBin, string accountNumber, decimal amount, string description, string accountName = "");
    }

    public class BankInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Bin { get; set; } = string.Empty;
        public string ShortName { get; set; } = string.Empty;
        public string Logo { get; set; } = string.Empty;
        public int TransferSupported { get; set; }
        public int LookupSupported { get; set; }
    }

    public class VietQRBankResponse
    {
        public string Code { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public List<BankInfo> Data { get; set; } = new List<BankInfo>();
    }
}
