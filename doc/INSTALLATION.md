# 🚀 Installation Guide - Restaurant POS System

Complete installation guide for setting up the Restaurant POS System on your local machine.

---

## 📋 Prerequisites

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | >= 18.0.0 | [Download](https://nodejs.org/) |
| **.NET SDK** | 8.0 | [Download](https://dotnet.microsoft.com/download) |
| **SQL Server** | 2019+ | [Download](https://www.microsoft.com/sql-server/sql-server-downloads) |
| **Git** | Latest | [Download](https://git-scm.com/) |

### Optional Software

| Software | Purpose |
|----------|---------|
| **Visual Studio 2022** | Backend development |
| **VS Code** | Frontend development |
| **SQL Server Management Studio** | Database management |
| **Postman** | API testing |

---

## 🎯 Installation Methods

### Option 1: Automatic Setup (Recommended)

**⚡ Fastest way to get started!**

```bash
# 1. Clone repository
git clone https://github.com/HUYVESEA0/RestaurantPOS-System.git
cd RestaurantPOS-System

# 2. Run setup script
setup.bat

# The script will:
# - Install frontend dependencies
# - Install backend dependencies
# - Create database
# - Run migrations
# - Seed data
# - Start both servers
```

### Option 2: Manual Setup

Follow these steps if automatic setup fails or you want more control.

---

## 📝 Step-by-Step Manual Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/HUYVESEA0/RestaurantPOS-System.git
cd RestaurantPOS-System
```

### Step 2: Database Setup

#### 2.1: Create Database

1. Open **SQL Server Management Studio**
2. Connect to your SQL Server instance
3. Create new database:

```sql
CREATE DATABASE RestaurantPOS;
```

#### 2.2: Update Connection String

Edit `RestaurantPOS.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=RestaurantPOS;Trusted_Connection=true;TrustServerCertificate=true;"
  }
}
```

**Replace `YOUR_SERVER` with:**
- `.` or `localhost` for local SQL Server
- `.\SQLEXPRESS` for SQL Server Express
- Your server name/IP for remote server

#### 2.3: Run Migrations

```bash
cd RestaurantPOS.API

# Install EF Core tools (if not already installed)
dotnet tool install --global dotnet-ef

# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### Step 3: Backend Setup

#### 3.1: Install Dependencies

```bash
cd RestaurantPOS.API
dotnet restore
```

#### 3.2: Configure Email (Optional)

Edit `appsettings.json`:

```json
{
  "Email": {
    "From": "your-email@gmail.com",
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password"
  }
}
```

**Get Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use generated password in config

#### 3.3: Configure JWT

Edit `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-at-least-32-characters-long",
    "Issuer": "RestaurantPOS",
    "Audience": "RestaurantPOS",
    "ExpireMinutes": 60
  }
}
```

### Step 4: Frontend Setup

#### 4.1: Install Dependencies

```bash
cd restaurant-pos-client
npm install
```

#### 4.2: Configure API URL

Create `.env` file in `restaurant-pos-client/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 5: Seed Data (Optional)

```bash
cd RestaurantPOS.API
dotnet run seed

# This creates:
# - Admin user (admin@bundaumet.com / Admin@123)
# - Sample products
# - Sample categories
# - Sample tables
```

### Step 6: Run Application

#### 6.1: Start Backend

```bash
cd RestaurantPOS.API
dotnet run
```

**Backend runs at:** `http://localhost:5000`

#### 6.2: Start Frontend (New Terminal)

```bash
cd restaurant-pos-client
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## ✅ Verification

### 1. Check Backend

Visit: `http://localhost:5000/api/health`

Expected response:
```json
{
  "status": "Healthy",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### 2. Check Frontend

Visit: `http://localhost:5173`

You should see the login page.

### 3. Test Login

**Default credentials:**
```
Email: admin@bundaumet.com
Password: Admin@123
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot connect to SQL Server"

**Solution:**
1. Check SQL Server is running
2. Verify connection string
3. Check Windows Authentication/SQL Authentication
4. Enable TCP/IP in SQL Server Configuration Manager

### Issue 2: "Port 5000 already in use"

**Solution:**
```bash
# Change port in RestaurantPOS.API/Properties/launchSettings.json
# Or kill process using port:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue 3: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 4: "Migration fails"

**Solution:**
```bash
# Delete migrations folder
rm -rf Migrations

# Recreate migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### Issue 5: "Email not sending"

**Solution:**
1. Check Gmail App Password (not your Gmail password)
2. Enable 2-Step Verification
3. Check SMTP settings
4. Check firewall/antivirus

---

## 🔧 Advanced Configuration

### HTTPS Setup

#### Backend:
```bash
dotnet dev-certs https --trust
```

Edit `launchSettings.json`:
```json
{
  "applicationUrl": "https://localhost:5001;http://localhost:5000"
}
```

#### Frontend:
Edit `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    https: true
  }
})
```

### CORS Configuration

Edit `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

### Environment-specific Settings

Create `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  }
}
```

---

## 📦 Production Deployment

### Build Frontend

```bash
cd restaurant-pos-client
npm run build

# Output in: dist/
```

### Publish Backend

```bash
cd RestaurantPOS.API
dotnet publish -c Release -o publish

# Output in: publish/
```

### Deploy to IIS

1. Install IIS
2. Install .NET Hosting Bundle
3. Create website in IIS
4. Point to `publish` folder
5. Configure application pool

### Deploy to Azure

See [DEPLOYMENT.md](DEPLOYMENT.md) for Azure deployment.

---

## 🔄 Updating

### Update Frontend

```bash
cd restaurant-pos-client
git pull
npm install
npm run dev
```

### Update Backend

```bash
cd RestaurantPOS.API
git pull
dotnet restore
dotnet ef database update
dotnet run
```

---

## 📚 Next Steps

After installation:

1. ✅ Read [USER_GUIDE.md](USER_GUIDE.md)
2. ✅ Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
3. ✅ Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
4. ✅ Review [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

---

## 🆘 Getting Help

- **Issues:** [GitHub Issues](https://github.com/HUYVESEA0/RestaurantPOS-System/issues)
- **Email:** support@bundaumet.com
- **Documentation:** [Full Docs](https://docs.bundaumet.com)

---

## ✨ Quick Reference

### Common Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
dotnet run           # Start backend
dotnet build         # Build project
dotnet ef database update    # Update database

# Database
dotnet ef migrations add <Name>      # Create migration
dotnet ef database update            # Apply migrations
dotnet ef database drop              # Drop database
```

### Default URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/swagger`

---

**Installation Time: ~15-20 minutes**

**Status: ✅ Complete**

**Happy Coding!** 🚀
