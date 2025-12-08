using System.Text.Json.Serialization;

namespace RestaurantPOS.Desktop.Models
{
    public class VietQRBankResponse
    {
        [JsonPropertyName("code")]
        public string Code { get; set; }

        [JsonPropertyName("desc")]
        public string Desc { get; set; }

        [JsonPropertyName("data")]
        public List<Bank> Data { get; set; }
    }

    public class Bank
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("code")]
        public string Code { get; set; }

        [JsonPropertyName("bin")]
        public string Bin { get; set; }

        [JsonPropertyName("shortName")]
        public string ShortName { get; set; }

        [JsonPropertyName("logo")]
        public string Logo { get; set; }

        [JsonPropertyName("transferSupported")]
        public int TransferSupported { get; set; }

        [JsonPropertyName("lookupSupported")]
        public int LookupSupported { get; set; }
        
        // Display property
        public string DisplayName => $"{ShortName} - {Name}";
    }
}
