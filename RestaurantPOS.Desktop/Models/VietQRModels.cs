using System.Text.Json.Serialization;

namespace RestaurantPOS.Desktop.Models
{
    public class VietQRBankResponse
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("desc")]
        public string Desc { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public List<Bank> Data { get; set; } = new List<Bank>();
    }

    public class Bank
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("bin")]
        public string Bin { get; set; } = string.Empty;

        [JsonPropertyName("shortName")]
        public string ShortName { get; set; } = string.Empty;

        [JsonPropertyName("logo")]
        public string Logo { get; set; } = string.Empty;

        [JsonPropertyName("transferSupported")]
        public int TransferSupported { get; set; }

        [JsonPropertyName("lookupSupported")]
        public int LookupSupported { get; set; }
        
        // Display property
        public string DisplayName => $"{ShortName} - {Name}";
    }
}
