using System.Net;
using System.Text.Json;

namespace RestaurantPOS.API.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Unhandled exception occurred");

        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse
        {
            Timestamp = DateTime.UtcNow,
            Path = context.Request.Path
        };

        switch (exception)
        {
            case KeyNotFoundException:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Title = "Not Found";
                errorResponse.Message = exception.Message;
                errorResponse.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
                break;

            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Title = "Unauthorized";
                errorResponse.Message = exception.Message;
                errorResponse.Type = "https://tools.ietf.org/html/rfc7235#section-3.1";
                break;

            case InvalidOperationException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Title = "Bad Request";
                errorResponse.Message = exception.Message;
                errorResponse.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
                break;

            case ArgumentException:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Title = "Bad Request";
                errorResponse.Message = exception.Message;
                errorResponse.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Title = "Internal Server Error";
                errorResponse.Message = _environment.IsDevelopment() ? exception.Message : "An unexpected error occurred. Please try again later.";
                errorResponse.Detail = _environment.IsDevelopment() ? exception.StackTrace : null;
                errorResponse.Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1";
                break;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        var json = JsonSerializer.Serialize(errorResponse, options);
        await response.WriteAsync(json);
    }
}

public class ErrorResponse
{
    public DateTime Timestamp { get; set; }
    public int StatusCode { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Detail { get; set; }
    public string Path { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
