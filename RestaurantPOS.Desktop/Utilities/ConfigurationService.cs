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
            var url = Constants.ApiBaseUrl.EndsWith("/") ? Constants.ApiBaseUrl : Constants.ApiBaseUrl + "/";
            client.BaseAddress = new Uri(url);
            return client;
        }

        public static async Task<bool> CheckApiConnectionAsync()
        {
            try
            {
                using (var client = CreateHttpClient())
                {
                    client.Timeout = TimeSpan.FromSeconds(3); // Timeout nhanh 3s
                    // Gọi thử API health check hoặc endpoint public bất kỳ
                    // Ở đây gọi root API hoặc endpoint đơn giản
                    var response = await client.GetAsync(""); 
                    // Chỉ cần không lỗi mạng là được, không cần status 200 (vì root có thể 404)
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public static Task InitializeAsync()
        {
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
