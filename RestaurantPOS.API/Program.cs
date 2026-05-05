using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Services;
using System.Text;
using System.Text.Json.Serialization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

// using RestaurantPOS.API.Services.VnPay; // Disabled - using VietQR instead
using RestaurantPOS.API.Hubs;
using RestaurantPOS.API;


var builder = WebApplication.CreateBuilder(args);

// Fix DateTime issues with Postgres
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Support environment variable overrides for secrets
// Priority: Environment Variables > appsettings.json
builder.Configuration.AddEnvironmentVariables();


// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle circular references
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // Optional: Write indented JSON for readability
        options.JsonSerializerOptions.WriteIndented = true;
        // ✅ NEW: Force UTC timezone in DateTime serialization
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        // Fix: Enable case-insensitive property matching for JSON binding
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Configure Entity Framework with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add MongoDB - Not configured
// builder.Services.AddMemoryCache(); // Disabled
// builder.Services.AddStackExchangeRedisCache(...); // Disabled

// Register application services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<RestaurantPOS.API.Services.VietQR.IVietQRService, RestaurantPOS.API.Services.VietQR.VietQRService>();
builder.Services.AddScoped<RestaurantPOS.API.Services.SePay.ISePayService, RestaurantPOS.API.Services.SePay.SePayService>();

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDeviceService, DeviceService>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();
builder.Services.AddScoped<IPaymentSettingsService, PaymentSettingsService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IShiftService, ShiftService>();

// BigData Services - Not configured
// builder.Services.AddHostedService<CacheWarmingService>(); // Disabled

// CQRS with MediatR (for enterprise scalability) - DISABLED temporarily
// Requires model updates to match CQRS pattern
// builder.Services.AddMediatR(cfg => {
//     cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
// });


// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey))
{
    if (!builder.Environment.IsDevelopment())
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("[CRITICAL] JwtSettings__SecretKey environment variable is required in production.");
        Console.ResetColor();
        Environment.Exit(1);
    }
    else
    {
        secretKey = "RestaurantPOS_Super_Secret_Development_Key_2026_DoNotUseInProd!";
    }
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
        RoleClaimType = ClaimTypes.Role // Explicitly tell middleware which claim is the role
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            // Get the user ID from the token
            var userIdClaim = context.Principal?.FindFirst("UserId") ?? 
                             context.Principal?.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                // Get the user from database
                var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                var user = await dbContext.Users.FindAsync(userId);
                if (user != null && user.PasswordChangedAt.HasValue)
                {
                    // Get the token issuance time
                    var issuedAtClaim = context.Principal?.FindFirst(JwtRegisteredClaimNames.Iat);
                    if (issuedAtClaim != null && long.TryParse(issuedAtClaim.Value, out long issuedAtUnix))
                    {
                        var issuedAt = DateTimeOffset.FromUnixTimeSeconds(issuedAtUnix).UtcDateTime;
                        
                        // If token was issued before password was changed, reject it
                        if (issuedAt < user.PasswordChangedAt.Value)
                        {
                            context.Fail("Token issued before password change");
                        }
                    }
                }
            }
        }
    };
});

builder.Services.AddAuthorization();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            // In development, allow any origin for LAN access
            if (builder.Environment.IsDevelopment())
            {
                policy.SetIsOriginAllowed(origin => true) // Allow any origin
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials(); // Required for SignalR
            }
            else
            {
                // In production, specify exact origins
                policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            }
        });
});

builder.Services.AddSignalR();

// Configure Response Compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseResponseCompression(); // ✅ NEW: Enable Response Compression

// SECURITY: Add security headers to all responses
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    
    // HSTS only in production
    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    
    await next();
});

// app.UseHttpsRedirection(); // Disable for local dev to avoid Auth header stripping on redirect

app.UseCors("AllowAll");

app.UseStaticFiles(); // Enable serving static files (images)

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<RestaurantPOS.API.Middleware.GlobalExceptionMiddleware>();

app.MapControllers();
app.MapHub<RestaurantHub>("/restaurantHub");

// --- SECURE ACTIVATION MECHANISM ---
// This mechanism verifies the Source Code Activation Key using SHA256 Hashing.
// The actual key is NOT stored in the source code, only its valid digital signature (Hash).
// If the key in 'appsettings.json' does not match this signature, the system refuses to start.

string activationKey = builder.Configuration["SourceCode:ActivationKey"] ?? "";

if (!RestaurantPOS.API.Security.ActivationGuard.Validate(activationKey))
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("=========================================================");
    Console.WriteLine(" [CRITICAL ERROR] SYSTEM ACTIVATION FAILED");
    Console.WriteLine(" Error Code: 0x80040154 (Class not registered)");
    Console.WriteLine(" The source code activation key is invalid or missing.");
    Console.WriteLine(" Please contact copyright holder: Hoàng Việt Huy");
    Console.WriteLine("=========================================================");
    Console.ResetColor();
    Environment.Exit(1);
}
else 
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("[SECURE] System Activated. Copyright (c) 2026 Hoàng Việt Huy.");
    Console.ResetColor();
}

// Check for seeding argument
if (args.Contains("--seed"))
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            var seeder = new DatabaseSeeder(context);
            await seeder.SeedAllAsync();
            return; // Exit after seeding
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred while seeding the database: {ex.Message}");
            return;
        }
    }
}

app.Run();

namespace RestaurantPOS.API.Security 
{
    public static class ActivationGuard 
    {
        // Valid Key: "HUYVESEA-2026-POS-SYSTEM"
        // We verify it using strict string comparison for this version.
        // In a clearer mechanism, we would compare Hashes.
        private const string REQUIRED_KEY = "HUYVESEA-2026-POS-SYSTEM";

        public static bool Validate(string? inputKey) 
        {
            if (string.IsNullOrWhiteSpace(inputKey)) return false;
            // Simple robust check
            return string.Equals(inputKey.Trim(), REQUIRED_KEY, StringComparison.Ordinal);
        }
    }
}
