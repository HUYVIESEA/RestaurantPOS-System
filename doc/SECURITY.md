# 🔒 Security Guide - Restaurant POS System

**Version:** 2.0.0  
**Last Updated:** January 15, 2024

Comprehensive security guidelines and best practices for Restaurant POS System.

---

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Authorization & Access Control](#authorization--access-control)
4. [Data Security](#data-security)
5. [API Security](#api-security)
6. [Frontend Security](#frontend-security)
7. [Database Security](#database-security)
8. [Infrastructure Security](#infrastructure-security)
9. [Security Checklist](#security-checklist)
10. [Vulnerability Reporting](#vulnerability-reporting)

---

## 🎯 Security Overview

### Security Architecture

```
┌─────────────────────────────────────────────┐
│         Security Layers                     │
├─────────────────────────────────────────────┤
│  1. Transport Security (HTTPS/TLS)          │
│  2. Authentication (JWT)                    │
│  3. Authorization (Role-based)              │
│  4. Input Validation                        │
│  5. Output Encoding                         │
│  6. Database Security                       │
│  7. Logging & Monitoring                    │
└─────────────────────────────────────────────┘
```

### Security Principles

**CIA Triad:**
- ✅ **Confidentiality** - Data accessible only to authorized users
- ✅ **Integrity** - Data remains accurate and unaltered
- ✅ **Availability** - System accessible when needed

**Defense in Depth:**
- Multiple layers of security
- Fail-safe defaults
- Least privilege principle
- Separation of duties

---

## 🔐 Authentication Security

### JWT Implementation

**Token Structure:**
```typescript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 1,
    "email": "user@example.com",
    "role": "Admin",
    "exp": 1640000000
  },
  "signature": "..."
}
```

**Backend Implementation:**
```csharp
// AuthService.cs
public string GenerateJwtToken(User user)
{
    var securityKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
    );
    
    var credentials = new SigningCredentials(
        securityKey, 
        SecurityAlgorithms.HmacSha256
    );
    
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };
    
    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddMinutes(60),
        signingCredentials: credentials
    );
    
    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

### Password Security

**Hashing with BCrypt:**
```csharp
// AuthService.cs
public string HashPassword(string password)
{
    // BCrypt with work factor 12
    return BCrypt.Net.BCrypt.HashPassword(password, 12);
}

public bool VerifyPassword(string password, string hash)
{
    return BCrypt.Net.BCrypt.Verify(password, hash);
}
```

**Password Requirements:**
```typescript
// Frontend validation
const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

const validatePassword = (password: string): boolean => {
  const rules = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ];
  
  return rules.every(rule => rule === true);
};
```

### Token Storage

**Frontend Best Practices:**
```typescript
// ✅ Good - HttpOnly cookie (if backend supports)
// Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict

// ⚠️ Acceptable - localStorage (current implementation)
localStorage.setItem('token', token);

// ❌ Bad - Regular cookie (vulnerable to XSS)
document.cookie = `token=${token}`;
```

### Session Management

**Token Expiration:**
```csharp
// appsettings.json
{
  "Jwt": {
    "ExpireMinutes": 60  // 1 hour
  }
}
```

**Refresh Token Strategy (TODO):**
```csharp
// Future implementation
public class RefreshToken
{
    public string Token { get; set; }
    public DateTime Expires { get; set; }
    public DateTime Created { get; set; }
    public string CreatedByIp { get; set; }
    public DateTime? Revoked { get; set; }
}
```

---

## 👤 Authorization & Access Control

### Role-Based Access Control (RBAC)

**Roles:**
```csharp
public enum UserRole
{
    Admin,
    Staff
}
```

**Permission Matrix:**

| Feature | Admin | Staff |
|---------|-------|-------|
| View Dashboard | ✅ | ✅ |
| Manage Products | ✅ | ✅ |
| Manage Orders | ✅ | ✅ |
| Manage Tables | ✅ | ✅ |
| Manage Users | ✅ | ❌ |
| View Analytics | ✅ | ⚠️ Limited |
| System Settings | ✅ | ❌ |

### Endpoint Protection

**Backend Authorization:**
```csharp
// UsersController.cs
[Authorize(Roles = "Admin")]
[HttpPost]
public async Task<IActionResult> CreateUser(CreateUserDto dto)
{
    // Only Admin can create users
}

[Authorize]
[HttpGet("{id}")]
public async Task<IActionResult> GetUser(int id)
{
    // Authenticated users can view users
    var currentUserId = GetCurrentUserId();
    
    // Users can only view their own profile (unless Admin)
    if (id != currentUserId && !User.IsInRole("Admin"))
    {
        return Forbid();
    }
    
    // ...
}
```

**Frontend Route Protection:**
```typescript
// App.tsx
const ProtectedRoute: React.FC<{ 
  element: React.ReactElement;
  requiredRole?: string;
}> = ({ element, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return element;
};

// Usage
<Route 
  path="/users" 
  element={
    <ProtectedRoute 
      element={<UserList />} 
      requiredRole="Admin" 
    />
  } 
/>
```

---

## 🛡️ Data Security

### Input Validation

**Backend Validation:**
```csharp
// DTOs with validation attributes
public class CreateProductDto
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, MinimumLength = 3)]
    public string Name { get; set; }
    
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Price must be positive")]
    public decimal Price { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Url(ErrorMessage = "Invalid URL format")]
    public string? ImageUrl { get; set; }
}
```

**Frontend Validation:**
```typescript
// ProductForm.tsx
const validateForm = (): boolean => {
  const errors: any = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }
  
  if (!formData.price || formData.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### SQL Injection Prevention

**Using EF Core (Safe):**
```csharp
// ✅ Good - Parameterized query
var products = await _context.Products
    .Where(p => p.Name.Contains(searchTerm))
    .ToListAsync();

// ❌ Bad - String concatenation (DON'T DO THIS)
var query = $"SELECT * FROM Products WHERE Name LIKE '%{searchTerm}%'";
```

### XSS Prevention

**React Default Protection:**
```typescript
// ✅ Safe - React escapes by default
<div>{product.name}</div>

// ⚠️ Dangerous - Only use if absolutely necessary
<div dangerouslySetInnerHTML={{ __html: product.description }} />

// ✅ Better - Sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(product.description) 
}} />
```

### Data Encryption

**In Transit (HTTPS):**
```csharp
// Program.cs - Force HTTPS
app.UseHttpsRedirection();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts(); // HTTP Strict Transport Security
}
```

**At Rest (Database):**
```sql
-- Transparent Data Encryption (TDE)
ALTER DATABASE RestaurantPOS
SET ENCRYPTION ON;

-- Column-level encryption for sensitive data
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'StrongPassword123!';
CREATE CERTIFICATE UserCert WITH SUBJECT = 'User Data Certificate';
CREATE SYMMETRIC KEY UserKey WITH ALGORITHM = AES_256 
ENCRYPTION BY CERTIFICATE UserCert;
```

---

## 🔌 API Security

### CORS Configuration

**Development:**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("Development",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

**Production:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production",
        builder => builder
            .WithOrigins("https://yoursite.com", "https://www.yoursite.com")
            .WithMethods("GET", "POST", "PUT", "DELETE")
            .WithHeaders("Content-Type", "Authorization")
            .AllowCredentials()
            .SetIsOriginAllowedToAllowWildcardSubdomains());
});
```

### Rate Limiting

**Implementation:**
```csharp
// Install: AspNetCoreRateLimit
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 60
        },
        new RateLimitRule
        {
            Endpoint = "*/auth/login",
            Period = "1h",
            Limit = 5  // Prevent brute force
        }
    };
});

app.UseIpRateLimiting();
```

### API Key Authentication (Optional)

```csharp
// For third-party integrations
public class ApiKeyMiddleware
{
    private readonly RequestDelegate _next;
    private const string API_KEY_HEADER = "X-API-Key";
    
    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(API_KEY_HEADER, out var apiKey))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("API Key missing");
            return;
        }
        
        // Validate API key
        if (!IsValidApiKey(apiKey))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid API Key");
            return;
        }
        
        await _next(context);
    }
}
```

---

## 💻 Frontend Security

### Security Headers

**Configure in backend:**
```csharp
app.Use(async (context, next) =>
{
    // Prevent clickjacking
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    
    // Prevent MIME type sniffing
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    
    // Enable XSS protection
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    
    // Referrer policy
    context.Response.Headers.Add("Referrer-Policy", "no-referrer");
    
    // Content Security Policy
    context.Response.Headers.Add("Content-Security-Policy", 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:;");
    
    await next();
});
```

### Secure Token Handling

**Axios Interceptor:**
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Prevent Common Vulnerabilities

**1. Open Redirect:**
```typescript
// ❌ Vulnerable
const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
window.location.href = returnUrl; // Can redirect to evil.com

// ✅ Safe
const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
if (returnUrl && returnUrl.startsWith('/')) {
  window.location.href = returnUrl;
} else {
  window.location.href = '/dashboard';
}
```

**2. DOM-based XSS:**
```typescript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Safe
element.textContent = userInput;

// Or use React (safe by default)
<div>{userInput}</div>
```

---

## 🗄️ Database Security

### Connection String Security

**Development:**
```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=RestaurantPOS;Trusted_Connection=true;"
  }
}
```

**Production (Use Azure Key Vault):**
```csharp
// Program.cs
if (builder.Environment.IsProduction())
{
    var keyVaultEndpoint = builder.Configuration["KeyVault:Endpoint"];
    builder.Configuration.AddAzureKeyVault(
        new Uri(keyVaultEndpoint),
        new DefaultAzureCredential()
    );
}
```

### Principle of Least Privilege

**Database User Permissions:**
```sql
-- Create application user
CREATE USER [AppUser] WITH PASSWORD = 'StrongPassword123!';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON Products TO [AppUser];
GRANT SELECT, INSERT, UPDATE, DELETE ON Orders TO [AppUser];
GRANT SELECT, INSERT, UPDATE, DELETE ON OrderItems TO [AppUser];

-- Don't grant DDL permissions (CREATE, ALTER, DROP)
```

### SQL Injection Tests

**Testing:**
```sql
-- Test inputs
' OR '1'='1
'; DROP TABLE Products; --
admin'--
1' UNION SELECT * FROM Users--
```

**Verify EF Core protection:**
```csharp
// All these should be safe with EF Core
var product = await _context.Products
    .Where(p => p.Name == searchTerm)
    .FirstOrDefaultAsync();
```

---

## 🏗️ Infrastructure Security

### Server Hardening

**Checklist:**
- [ ] Keep OS updated
- [ ] Disable unnecessary services
- [ ] Configure firewall
- [ ] Use strong passwords
- [ ] Enable 2FA for admin access
- [ ] Regular security audits
- [ ] Backup regularly

### Network Security

**Firewall Rules:**
```bash
# Allow HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow HTTP (redirect to HTTPS)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Block all other incoming
iptables -P INPUT DROP
```

### SSL/TLS Configuration

**Let's Encrypt:**
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yoursite.com -d www.yoursite.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ Security Checklist

### Pre-Deployment

**Backend:**
- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection tests passed
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured (no sensitive data)

**Frontend:**
- [ ] All API calls use HTTPS
- [ ] Token stored securely
- [ ] No sensitive data in console.log
- [ ] XSS prevention tested
- [ ] CSRF protection implemented
- [ ] Security headers configured

**Database:**
- [ ] Strong password
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] Encryption enabled
- [ ] Least privilege access

### Post-Deployment

**Monitoring:**
- [ ] Failed login attempts
- [ ] Unusual API activity
- [ ] Database access patterns
- [ ] Error rates
- [ ] Performance metrics

**Regular Tasks:**
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Penetration testing yearly

---

## 🚨 Vulnerability Reporting

### How to Report

**If you discover a security vulnerability:**

**DO NOT** create a public GitHub issue.

**Instead:**
1. Email: security@bundaumet.com
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours:** Initial acknowledgment
- **48 hours:** Severity assessment
- **7 days:** Fix for critical issues
- **30 days:** Fix for non-critical issues

### Hall of Fame

Contributors who responsibly disclose security issues will be:
- ✅ Acknowledged (if desired)
- ✅ Listed in security hall of fame
- ✅ Credited in changelog

---

## 📚 Security Resources

### Tools

**Security Scanning:**
- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp)
- [Snyk](https://snyk.io/)

**Dependency Checking:**
```bash
# Frontend
npm audit
npm audit fix

# Backend
dotnet list package --vulnerable
```

**Static Analysis:**
```bash
# Frontend
npm install -g eslint-plugin-security

# Backend
# Use SonarQube or Visual Studio Code Analysis
```

### Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Microsoft Security Best Practices](https://docs.microsoft.com/en-us/dotnet/standard/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)

---

## 🔐 Security Compliance

### GDPR Considerations

If handling EU user data:
- [ ] Right to access
- [ ] Right to deletion
- [ ] Data portability
- [ ] Privacy policy
- [ ] Cookie consent
- [ ] Data breach notification

### PCI DSS (If accepting payments)

- [ ] Secure network
- [ ] Protect cardholder data
- [ ] Vulnerability management
- [ ] Access control
- [ ] Monitoring and testing
- [ ] Security policy

---

## 📞 Security Contact

**Security Team:**
- 📧 Email: security@bundaumet.com
- 🔒 PGP Key: [Link to public key]
- ⏰ Response Time: 24 hours

---

**Last Updated:** January 15, 2024  
**Version:** 2.0.0  
**Next Review:** April 15, 2024

**Security is everyone's responsibility!** 🔒
