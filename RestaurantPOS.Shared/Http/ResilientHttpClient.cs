using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace RestaurantPOS.Shared.Http;

public class ResilientHttpClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ResilientHttpClient> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    private static readonly Random _jitter = new();

    public ResilientHttpClient(HttpClient httpClient, ILogger<ResilientHttpClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(5);
        _httpClient.DefaultRequestHeaders.Add("x-service-name", "restaurant-pos");
    }

    public async Task<T?> GetAsync<T>(string url, string? correlationId = null)
    {
        using var activity = new System.Diagnostics.Activity("ResilientHttpClient.Get");
        activity.Start();

        for (int attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                using var request = CreateRequest(HttpMethod.Get, url, correlationId);
                using var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                    return await response.Content.ReadFromJsonAsync<T>(JsonOptions);

                if ((int)response.StatusCode >= 500 && attempt < 3)
                {
                    _logger.LogWarning("Attempt {Attempt}: Server error from {Url}. Retrying...", attempt, url);
                    await DelayWithJitter(attempt);
                    continue;
                }

                _logger.LogError("HTTP {StatusCode} from {Url}", response.StatusCode, url);
                return default;
            }
            catch (TaskCanceledException) when (attempt < 3)
            {
                _logger.LogWarning("Attempt {Attempt}: Timeout calling {Url}. Retrying...", attempt, url);
                await DelayWithJitter(attempt);
            }
            catch (HttpRequestException ex) when (attempt < 3)
            {
                _logger.LogWarning("Attempt {Attempt}: Network error calling {Url}: {Message}", attempt, url, ex.Message);
                await DelayWithJitter(attempt);
            }
        }

        return default;
    }

    public async Task<TResponse?> PostAsync<TRequest, TResponse>(string url, TRequest body, string? correlationId = null)
    {
        for (int attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                using var request = CreateJsonRequest(HttpMethod.Post, url, body, correlationId);
                using var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                    return await response.Content.ReadFromJsonAsync<TResponse>(JsonOptions);

                if ((int)response.StatusCode >= 500 && attempt < 3)
                {
                    _logger.LogWarning("Attempt {Attempt}: Server error POST {Url}. Retrying...", attempt, url);
                    await DelayWithJitter(attempt);
                    continue;
                }

                response.EnsureSuccessStatusCode();
                return default;
            }
            catch (TaskCanceledException) when (attempt < 3)
            {
                _logger.LogWarning("Attempt {Attempt}: Timeout POST {Url}. Retrying...", attempt, url);
                await DelayWithJitter(attempt);
            }
            catch (HttpRequestException ex) when (attempt < 3)
            {
                _logger.LogWarning("Attempt {Attempt}: Network error POST {Url}: {Message}", attempt, url, ex.Message);
                await DelayWithJitter(attempt);
            }
        }

        return default;
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string url, string? correlationId)
    {
        var request = new HttpRequestMessage(method, url);
        if (!string.IsNullOrEmpty(correlationId))
            request.Headers.Add("x-correlation-id", correlationId);
        return request;
    }

    private HttpRequestMessage CreateJsonRequest<T>(HttpMethod method, string url, T body, string? correlationId)
    {
        var request = new HttpRequestMessage(method, url)
        {
            Content = JsonContent.Create(body, null, JsonOptions)
        };
        if (!string.IsNullOrEmpty(correlationId))
            request.Headers.Add("x-correlation-id", correlationId);
        return request;
    }

    private static async Task DelayWithJitter(int attempt)
    {
        var baseDelay = 100 * Math.Pow(2, attempt - 1);
        var jitter = _jitter.Next(0, 100);
        await Task.Delay(TimeSpan.FromMilliseconds(baseDelay + jitter));
    }
}
