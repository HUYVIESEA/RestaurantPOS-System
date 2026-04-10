using System.Diagnostics;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace RestaurantPOS.Shared.Observability;

public static class TelemetryConfig
{
    public static readonly string ServiceName = "restaurant-pos";
    public static readonly ActivitySource ActivitySource = new(ServiceName, "1.0.0");

    public static void ConfigureTracing(this WebApplicationBuilder builder, string serviceName)
    {
        builder.Services.AddOpenTelemetry()
            .WithTracing(tracing =>
            {
                tracing
                    .SetResourceBuilder(OpenTelemetry.Resources.ResourceBuilder.CreateDefault()
                        .AddService(serviceName))
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddEntityFrameworkCoreInstrumentation()
                    .AddSource(ActivitySource.Name);

                if (builder.Environment.IsDevelopment())
                {
                    tracing.AddConsoleExporter();
                }

                var otlpEndpoint = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"];
                if (!string.IsNullOrEmpty(otlpEndpoint))
                {
                    tracing.AddOtlpExporter(options =>
                    {
                        options.Endpoint = new Uri(otlpEndpoint);
                    });
                }
            });
    }
}
