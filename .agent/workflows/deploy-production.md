---
description: Deploy dự án lên production server
---

# Deploy to Production

Workflow này hướng dẫn deploy RestaurantPOS System lên production environment.

## Prerequisites

1. ✅ Đã chạy `/build-production` thành công
2. ✅ Production server đã sẵn sàng
3. ✅ Domain/IP đã được cấu hình
4. ✅ SSL certificate đã được setup (recommended)
5. ✅ Database backup đã được tạo

## Deployment Options

### Option 1: Windows Server (IIS)
### Option 2: Linux Server (Nginx + Kestrel)
### Option 3: Cloud Hosting (Azure/AWS)
### Option 4: Docker
### Option 5: VPS Manual Setup

## Option 1: Windows Server + IIS

### 1. Chuẩn bị Server

**Install IIS:**
```powershell
# Run as Administrator
Install-WindowsFeature -name Web-Server -IncludeManagementTools
```

**Install .NET Hosting Bundle:**
- Download: https://dotnet.microsoft.com/download/dotnet/8.0
- Install: `dotnet-hosting-8.0-win.exe`
- Restart IIS: `iisreset`

**Install URL Rewrite Module:**
- Download: https://www.iis.net/downloads/microsoft/url-rewrite

### 2. Deploy Backend API

**Copy files to server:**
```powershell
# Trên máy local
scp -r RestaurantPOS.API\publish\* user@server:C:\inetpub\restaurant-api
```

**Create IIS Site:**
1. Open IIS Manager
2. Right-click Sites → Add Website
3. Site name: `RestaurantPOS-API`
4. Physical path: `C:\inetpub\restaurant-api`
5. Binding: HTTP, Port 80 (hoặc 443 cho HTTPS)
6. Application Pool: `.NET v8.0` (No Managed Code)

**Configure Application Pool:**
1. Select Application Pool
2. Basic Settings → .NET CLR version: `No Managed Code`
3. Advanced Settings → Enable 32-Bit Applications: `False`
4. Start Mode: `AlwaysRunning`

**Setup Environment:**
```xml
<!-- web.config -->
<aspNetCore processPath="dotnet"
            arguments=".\RestaurantPOS.API.dll"
            stdoutLogEnabled="true"
            stdoutLogFile=".\logs\stdout"
            hostingModel="inprocess">
  <environmentVariables>
    <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
  </environmentVariables>
</aspNetCore>
```

### 3. Deploy Frontend

**Copy build files:**
```powershell
scp -r restaurant-pos-client\dist\* user@server:C:\inetpub\restaurant-client
```

**Create IIS Site:**
1. Add Website
2. Site name: `RestaurantPOS-Client`
3. Physical path: `C:\inetpub\restaurant-client`
4. Binding: HTTP, Port 80

**Configure URL Rewrite:**
```xml
<!-- web.config in dist folder -->
<?xml version="1.0"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Option 2: Linux Server (Ubuntu)

### 1. Setup Server

**Update system:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Install .NET Runtime:**
```bash
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0
```

**Install Nginx:**
```bash
sudo apt install nginx -y
```

**Install Node.js (if needed):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

### 2. Deploy Backend API

**Copy files:**
```bash
scp -r RestaurantPOS.API/publish/* user@server:/var/www/restaurant-api/
```

**Create systemd service:**
```bash
sudo nano /etc/systemd/system/restaurant-api.service
```

```ini
[Unit]
Description=Restaurant POS API

[Service]
WorkingDirectory=/var/www/restaurant-api
ExecStart=/usr/bin/dotnet /var/www/restaurant-api/RestaurantPOS.API.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=restaurant-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**
```bash
sudo systemctl enable restaurant-api
sudo systemctl start restaurant-api
sudo systemctl status restaurant-api
```

**Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/restaurant-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/restaurant-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Deploy Frontend

**Copy files:**
```bash
scp -r restaurant-pos-client/dist/* user@server:/var/www/restaurant-client/
```

**Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/restaurant-client
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/restaurant-client;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/restaurant-client /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Option 3: Docker Deployment

### 1. Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
# RestaurantPOS.API/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY publish/ .
EXPOSE 5000
ENTRYPOINT ["dotnet", "RestaurantPOS.API.dll"]
```

**Frontend Dockerfile:**
```dockerfile
# restaurant-pos-client/Dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ./RestaurantPOS.API
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  client:
    build:
      context: ./restaurant-pos-client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped
```

### 3. Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Linux)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Cloudflare

1. Add site to Cloudflare
2. Update nameservers
3. Enable SSL/TLS (Full or Full Strict)
4. Enable Auto HTTPS Rewrites

## Database Setup

### Production Database

**Backup existing data (if upgrade):**
```powershell
cp restaurant_pos.db restaurant_pos_backup_$(date +%Y%m%d).db
```

**Copy database to server:**
```bash
scp restaurant_pos.db user@server:/var/www/restaurant-api/
```

**Set permissions (Linux):**
```bash
sudo chown www-data:www-data /var/www/restaurant-api/restaurant_pos.db
sudo chmod 644 /var/www/restaurant-api/restaurant_pos.db
```

**Run migrations:**
```bash
cd /var/www/restaurant-api
dotnet ef database update
```

## Post-Deployment Checklist

- [ ] API endpoint accessible
- [ ] Frontend loads correctly
- [ ] Database connection working
- [ ] Login functionality working
- [ ] HTTPS/SSL working
- [ ] Environment variables set correctly
- [ ] Logs are being written
- [ ] Error handling working
- [ ] CORS configured properly
- [ ] Firewall rules configured
- [ ] Backup system in place
- [ ] Monitoring setup

## Monitoring

### Setup Logging

**Backend (Serilog):**
```csharp
// Program.cs
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));
```

**Check logs:**
```bash
# Linux
tail -f /var/www/restaurant-api/logs/log.txt

# Windows
Get-Content C:\inetpub\restaurant-api\logs\log.txt -Wait
```

### Health Checks

**Test API:**
```bash
curl https://api.yourdomain.com/health
```

**Test Frontend:**
```bash
curl https://yourdomain.com
```

## Rollback Procedure

### If deployment fails:

**1. Restore previous version:**
```bash
# Stop service
sudo systemctl stop restaurant-api

# Restore backup
cp /var/www/restaurant-api-backup/* /var/www/restaurant-api/

# Start service
sudo systemctl start restaurant-api
```

**2. Restore database:**
```bash
cp restaurant_pos_backup.db restaurant_pos.db
```

**3. Clear cache:**
```bash
# Clear browser cache
# Clear CDN cache (if using)
```

## Troubleshooting

### API not starting

**Check logs:**
```bash
journalctl -u restaurant-api -f
```

**Check permissions:**
```bash
ls -la /var/www/restaurant-api
```

### Database errors

**Check connection string**
**Verify file permissions**
**Run migrations manually**

### Frontend 404 errors

**Verify URL rewrite rules**
**Check nginx configuration**
**Clear browser cache**

## Automation Scripts

### Deploy script

```bash
#!/bin/bash
# deploy.sh

echo "Deploying Restaurant POS System..."

# Stop services
sudo systemctl stop restaurant-api

# Backup current version
cp -r /var/www/restaurant-api /var/www/restaurant-api-backup

# Deploy new version
cp -r publish/* /var/www/restaurant-api/

# Run migrations
cd /var/www/restaurant-api
dotnet ef database update

# Start services
sudo systemctl start restaurant-api

echo "Deployment complete!"
```

## Next Steps

- Setup automated backups
- Configure monitoring (Grafana, Prometheus)
- Setup logging aggregation
- Configure alerts
- Document production URLs and credentials
- Train staff on new system
