# 🚀 Deployment Guide - Restaurant POS System

**Version:** 2.0.0  
**Last Updated:** January 15, 2024

Complete guide for deploying Restaurant POS System to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Build for Production](#build-for-production)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Database Deployment](#database-deployment)
6. [Environment Configuration](#environment-configuration)
7. [CI/CD Setup](#cicd-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Hardening](#security-hardening)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Before you deploy, ensure:

**Code Quality:**
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Changelog updated

**Security:**
- [ ] Secrets removed from code
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] SQL injection tests passed
- [ ] XSS protection verified

**Performance:**
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized (<500KB)
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Caching configured

**Database:**
- [ ] Migrations tested
- [ ] Backup strategy defined
- [ ] Indexes created
- [ ] Connection pooling configured

**Monitoring:**
- [ ] Error logging configured
- [ ] Performance monitoring setup
- [ ] Uptime monitoring configured
- [ ] Alerts configured

---

## 🔨 Build for Production

### Frontend Build

```bash
cd restaurant-pos-client

# 1. Install dependencies
npm install

# 2. Run production build
npm run build

# 3. Preview build locally
npm run preview

# Output: dist/ folder
```

**Build optimization:**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});
```

### Backend Build

```bash
cd RestaurantPOS.API

# 1. Restore packages
dotnet restore

# 2. Build in Release mode
dotnet build -c Release

# 3. Publish
dotnet publish -c Release -o ./publish

# Output: publish/ folder
```

**Publishing options:**
```bash
# Self-contained (includes .NET runtime)
dotnet publish -c Release -r win-x64 --self-contained

# Framework-dependent (requires .NET runtime on server)
dotnet publish -c Release --no-self-contained
```

---

## 🌐 Frontend Deployment

### Option 1: Netlify (Recommended for Frontend)

**Automatic Deployment:**

**1. Connect Repository:**
```
1. Go to netlify.com
2. Click "New site from Git"
3. Choose GitHub
4. Select repository
```

**2. Configure Build:**
```
Build command: npm run build
Publish directory: dist
```

**3. Environment Variables:**
```
VITE_API_BASE_URL = https://your-api.com/api
```

**4. Deploy Settings:**
```yaml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Custom Domain:**
```
1. Go to Domain settings
2. Add custom domain
3. Configure DNS
4. Enable HTTPS (automatic)
```

---

### Option 2: Vercel

**Deploy with Vercel:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd restaurant-pos-client
vercel --prod
```

**Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://your-api.com/api"
  }
}
```

---

### Option 3: Azure Static Web Apps

**Deploy to Azure:**

```bash
# Install Azure CLI
az login

# Create static web app
az staticwebapp create \
  --name restaurant-pos-frontend \
  --resource-group your-rg \
  --source https://github.com/YOUR_USERNAME/RestaurantPOS-System \
  --location "East Asia" \
  --branch main \
  --app-location "restaurant-pos-client" \
  --output-location "dist"
```

**GitHub Actions:**
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "restaurant-pos-client"
          output_location: "dist"
```

---

### Option 4: AWS S3 + CloudFront

**1. Build:**
```bash
npm run build
```

**2. Upload to S3:**
```bash
# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://restaurant-pos-frontend

# Upload files
aws s3 sync dist/ s3://restaurant-pos-frontend

# Enable static website hosting
aws s3 website s3://restaurant-pos-frontend \
  --index-document index.html \
  --error-document index.html
```

**3. Configure CloudFront:**
```bash
# Create distribution
aws cloudfront create-distribution \
  --origin-domain-name restaurant-pos-frontend.s3.amazonaws.com
```

---

## 🖥️ Backend Deployment

### Option 1: Azure App Service (Recommended)

**Deploy via Azure CLI:**

```bash
# Login to Azure
az login

# Create resource group
az group create --name restaurant-pos-rg --location "Southeast Asia"

# Create App Service plan
az appservice plan create \
  --name restaurant-pos-plan \
  --resource-group restaurant-pos-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name restaurant-pos-api \
  --resource-group restaurant-pos-rg \
  --plan restaurant-pos-plan \
  --runtime "DOTNET|8.0"

# Deploy
cd RestaurantPOS.API
az webapp up \
  --name restaurant-pos-api \
  --resource-group restaurant-pos-rg
```

**Configure App Settings:**
```bash
# Connection string
az webapp config connection-string set \
  --name restaurant-pos-api \
  --resource-group restaurant-pos-rg \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="Server=..."

# App settings
az webapp config appsettings set \
  --name restaurant-pos-api \
  --resource-group restaurant-pos-rg \
  --settings \
    "Jwt__Key=your-secret-key" \
    "Jwt__Issuer=RestaurantPOS" \
    "Email__From=noreply@yoursite.com"
```

---

### Option 2: AWS Elastic Beanstalk

**Deploy to AWS:**

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p "64bit Amazon Linux 2 v2.3.0 running .NET Core" \
  --region us-east-1

# Create environment
eb create restaurant-pos-api-env

# Deploy
eb deploy

# Open in browser
eb open
```

**Configuration (.ebextensions/options.config):**
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    ASPNETCORE_ENVIRONMENT: Production
    ConnectionStrings__DefaultConnection: "Server=..."
```

---

### Option 3: Docker + Any Cloud

**Dockerfile:**
```dockerfile
# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy and restore
COPY *.csproj ./
RUN dotnet restore

# Copy and build
COPY . ./
RUN dotnet publish -c Release -o out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Expose port
EXPOSE 80
ENTRYPOINT ["dotnet", "RestaurantPOS.API.dll"]
```

**Build and Push:**
```bash
# Build image
docker build -t restaurant-pos-api .

# Tag for registry
docker tag restaurant-pos-api your-registry/restaurant-pos-api:latest

# Push to registry
docker push your-registry/restaurant-pos-api:latest
```

**Deploy to Azure Container Instances:**
```bash
az container create \
  --resource-group restaurant-pos-rg \
  --name restaurant-pos-api \
  --image your-registry/restaurant-pos-api:latest \
  --dns-name-label restaurant-pos-api \
  --ports 80
```

---

### Option 4: Self-Hosted (IIS)

**Prerequisites:**
- Windows Server 2019+
- IIS installed
- .NET 8.0 Hosting Bundle

**Steps:**

**1. Publish application:**
```bash
dotnet publish -c Release -o C:\inetpub\wwwroot\restaurant-pos-api
```

**2. Create IIS Site:**
```powershell
# In IIS Manager
1. Right-click "Sites" → "Add Website"
2. Site name: RestaurantPOS
3. Physical path: C:\inetpub\wwwroot\restaurant-pos-api
4. Port: 80 (or custom)
5. Click OK
```

**3. Configure Application Pool:**
```
1. Select "Application Pools"
2. Right-click site pool → "Basic Settings"
3. .NET CLR version: "No Managed Code"
4. Set identity to appropriate account
```

**4. Set permissions:**
```powershell
icacls "C:\inetpub\wwwroot\restaurant-pos-api" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

---

## 🗄️ Database Deployment

### Option 1: Azure SQL Database

**Create Database:**
```bash
# Create SQL Server
az sql server create \
  --name restaurant-pos-sql \
  --resource-group restaurant-pos-rg \
  --location "Southeast Asia" \
  --admin-user sqladmin \
  --admin-password "YourP@ssw0rd!"

# Create database
az sql db create \
  --resource-group restaurant-pos-rg \
  --server restaurant-pos-sql \
  --name RestaurantPOS \
  --service-objective S0

# Configure firewall
az sql server firewall-rule create \
  --resource-group restaurant-pos-rg \
  --server restaurant-pos-sql \
  --name AllowAllAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Run Migrations:**
```bash
# Update connection string in appsettings.json
# Then run migrations
dotnet ef database update
```

---

### Option 2: AWS RDS

**Create RDS Instance:**
```bash
aws rds create-db-instance \
  --db-instance-identifier restaurant-pos-db \
  --db-instance-class db.t3.micro \
  --engine sqlserver-ex \
  --master-username admin \
  --master-user-password YourPassword123! \
  --allocated-storage 20
```

---

### Option 3: Self-Hosted SQL Server

**Backup from Development:**
```sql
-- Backup database
BACKUP DATABASE RestaurantPOS
TO DISK = 'C:\Backup\RestaurantPOS.bak'
WITH COMPRESSION;
```

**Restore to Production:**
```sql
-- Restore database
RESTORE DATABASE RestaurantPOS
FROM DISK = 'C:\Backup\RestaurantPOS.bak'
WITH REPLACE;
```

---

## ⚙️ Environment Configuration

### Frontend Environment

**Production (.env.production):**
```env
VITE_API_BASE_URL=https://api.yoursite.com/api
```

**Staging (.env.staging):**
```env
VITE_API_BASE_URL=https://api-staging.yoursite.com/api
```

### Backend Environment

**Production (appsettings.Production.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=prod-sql.database.windows.net;Database=RestaurantPOS;User Id=admin;Password=...;Encrypt=true;"
  },
  "Jwt": {
    "Key": "production-secret-key-minimum-32-characters-long",
    "Issuer": "RestaurantPOS",
    "Audience": "RestaurantPOS",
    "ExpireMinutes": 60
  },
  "Email": {
    "From": "noreply@yoursite.com",
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning"
    }
  },
  "AllowedHosts": "yoursite.com,www.yoursite.com"
}
```

---

## 🔄 CI/CD Setup

### GitHub Actions

**Frontend CI/CD (.github/workflows/frontend.yml):**
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd restaurant-pos-client
          npm ci
      
      - name: Build
        run: |
          cd restaurant-pos-client
          npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=restaurant-pos-client/dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Backend CI/CD (.github/workflows/backend.yml):**
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '8.0.x'
      
      - name: Restore dependencies
        run: dotnet restore RestaurantPOS.API
      
      - name: Build
        run: dotnet build RestaurantPOS.API -c Release --no-restore
      
      - name: Test
        run: dotnet test RestaurantPOS.API --no-build --verbosity normal
      
      - name: Publish
        run: dotnet publish RestaurantPOS.API -c Release -o ./publish
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: restaurant-pos-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish
```

---

## 📊 Monitoring & Logging

### Application Insights (Azure)

**1. Install package:**
```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

**2. Configure:**
```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

**3. appsettings.json:**
```json
{
  "ApplicationInsights": {
    "InstrumentationKey": "your-key-here"
  }
}
```

---

### Uptime Monitoring

**UptimeRobot (Free):**
```
1. Go to uptimerobot.com
2. Add New Monitor
3. Type: HTTPS
4. URL: https://yoursite.com
5. Monitoring Interval: 5 minutes
6. Alert Contacts: your-email@example.com
```

---

### Error Tracking - Sentry

**Frontend:**
```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

**Backend:**
```csharp
// Program.cs
builder.WebHost.UseSentry(options =>
{
    options.Dsn = "your-sentry-dsn";
    options.Environment = "production";
});
```

---

## 🔒 Security Hardening

### SSL/HTTPS

**Let's Encrypt (Free SSL):**
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yoursite.com

# Auto-renew
sudo certbot renew --dry-run
```

---

### Security Headers

**Add to backend:**
```csharp
// Program.cs
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "no-referrer");
    await next();
});
```

---

### Rate Limiting

```csharp
// Install package
dotnet add package AspNetCoreRateLimit

// Program.cs
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*",
            Limit = 1000,
            Period = "1h"
        }
    };
});

app.UseIpRateLimiting();
```

---

## 🐛 Troubleshooting

### Build fails

**Frontend:**
```bash
# Clear cache
rm -rf node_modules .vite
npm install
npm run build
```

**Backend:**
```bash
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

---

### Deployment succeeds but site doesn't work

**Check:**
1. Environment variables configured
2. Database connection string correct
3. CORS settings allow frontend domain
4. HTTPS configured
5. Check application logs

---

### Database connection fails

**Verify:**
```csharp
// Add to Program.cs for testing
app.MapGet("/health", async (ApplicationDbContext db) =>
{
    try
    {
        await db.Database.CanConnectAsync();
        return Results.Ok("Database connected");
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});
```

---

## 📞 Support

**Deployment Issues?**
- 📧 Email: deploy@bundaumet.com
- 📖 Docs: `/doc`
- 🐛 GitHub Issues

---

**Deployment Complete!** 🎉

**Last Updated:** January 15, 2024  
**Version:** 2.0.0
