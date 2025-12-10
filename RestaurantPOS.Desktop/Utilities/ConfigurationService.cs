using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Linq;

namespace RestaurantPOS.Desktop.Utilities
{
    public static class ConfigurationService
    {
        public static HttpClient CreateHttpClient()
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri(Constants.ApiBaseUrl);
            return client;
        }

        public static Task InitializeAsync()
        {
            // Do nothing
            return Task.CompletedTask;
        }
    }

    // Class phụ để hứng data JSON từ Ngrok
    public class NgrokApiResponse
    {
        [JsonPropertyName("tunnels")]
        public List<NgrokTunnel> Tunnels { get; set; }
    }

    public class NgrokTunnel
    {
        [JsonPropertyName("public_url")]
        public string PublicUrl { get; set; }
    }
}
