# ❓ Frequently Asked Questions (FAQ)

**Version:** 2.0.0  
**Last Updated:** January 15, 2024

Common questions and answers about Restaurant POS System.

---

## 📋 Table of Contents

1. [General Questions](#general-questions)
2. [Installation & Setup](#installation--setup)
3. [Usage Questions](#usage-questions)
4. [Technical Questions](#technical-questions)
5. [Authentication & Security](#authentication--security)
6. [Features & Functionality](#features--functionality)
7. [Troubleshooting](#troubleshooting)
8. [Performance & Optimization](#performance--optimization)
9. [Deployment](#deployment)
10. [Contributing](#contributing)

---

## 🌟 General Questions

### What is Restaurant POS System?

Restaurant POS System is a complete point-of-sale application for managing restaurant operations including orders, products, tables, and analytics.

**Key Features:**
- ✅ Order Management
- ✅ Product Catalog
- ✅ Table Management
- ✅ User Management
- ✅ Analytics Dashboard
- ✅ Dark Mode
- ✅ Responsive Design

---

### What technologies are used?

**Frontend:**
- React 18.2.0 + TypeScript
- Vite (build tool)
- React Router (navigation)
- Axios (HTTP client)

**Backend:**
- .NET 8.0
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server

---

### Is it free to use?

Yes! Restaurant POS System is **open source** and licensed under MIT License. You can:
- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute copies
- ✅ Use privately

---

### Can I use it for my restaurant?

Absolutely! This system is designed for real-world restaurant use. You can:
- Deploy it on your own server
- Customize for your needs
- Add your branding
- Extend features

---

## 🔧 Installation & Setup

### What are the system requirements?

**Development:**
- Node.js >= 18.0.0
- .NET SDK 8.0
- SQL Server 2019+
- 4GB RAM minimum
- Windows/Mac/Linux

**Production:**
- Modern web browser (Chrome, Edge, Firefox, Safari)
- Internet connection
- Recommended: 8GB RAM server

---

### How do I install the system?

**Quick Install:**
```bash
# 1. Clone repository
git clone https://github.com/HUYVESEA0/RestaurantPOS-System.git

# 2. Run setup
cd RestaurantPOS-System
setup.bat
```

**Manual Install:**
See [INSTALLATION.md](INSTALLATION.md) for detailed instructions.

---

### Setup script fails. What should I do?

**Common solutions:**

**1. Check Prerequisites:**
```bash
# Verify installations
node --version
npm --version
dotnet --version
```

**2. Clean and Retry:**
```bash
clean.bat
setup.bat
```

**3. Manual Setup:**
Follow [INSTALLATION.md](INSTALLATION.md) step-by-step

---

### Database connection fails. How to fix?

**Check connection string:**
```json
// appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=RestaurantPOS;Trusted_Connection=true;TrustServerCertificate=true;"
}
```

**Common fixes:**
1. Verify SQL Server is running
2. Check server name (`.` or `localhost` or `.\SQLEXPRESS`)
3. Enable TCP/IP in SQL Server Configuration Manager
4. Check Windows Authentication/SQL Authentication

---

### How do I start the application?

**Development Mode:**
```bash
# Quick start
run.bat

# Manual start
# Terminal 1 - Backend
cd RestaurantPOS.API
dotnet run

# Terminal 2 - Frontend
cd restaurant-pos-client
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Swagger: http://localhost:5000/swagger

---

## 💼 Usage Questions

### What are the default login credentials?

```
Email: admin@bundaumet.com
Password: Admin@123
```

**⚠️ Important:** Change default password in production!

---

### How do I create a new user?

**As Admin:**
1. Login with admin account
2. Go to "Người dùng" (Users)
3. Click "➕ Thêm Người Dùng"
4. Fill in details
5. Select role (Admin/Staff)
6. Click "Tạo"

**Via Registration:**
1. Click "Đăng ký" on login page
2. Fill registration form
3. Verify email
4. Login

---

### How do I add products?

**Steps:**
1. Go to "Sản phẩm" (Products)
2. Click "➕ Thêm Sản Phẩm"
3. Enter:
   - Name
   - Price (in VND)
   - Category
   - Description (optional)
4. Click "Lưu"

**Bulk Import:** Not yet available (planned for v3.0)

---

### How do I create an order?

**Steps:**
1. Go to "Đơn hàng" (Orders)
2. Click "➕ Tạo Đơn"
3. Select table
4. Add products (click + button)
5. Adjust quantities
6. Add notes (optional)
7. Click "Tạo Đơn"

---

### Can I cancel an order?

**Yes!**

**Steps:**
1. Go to order detail
2. Click "❌ Hủy đơn"
3. Enter reason
4. Confirm

**Note:** Cancelled orders cannot be recovered

---

### How do I change my password?

**Steps:**
1. Click user icon (top right)
2. Select "Đổi mật khẩu"
3. Enter:
   - Current password
   - New password
   - Confirm new password
4. Click "Đổi Mật Khẩu"

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

### How do I enable Dark Mode?

**Two ways:**

**Method 1:**
- Click ☀️/🌙 icon in navbar

**Method 2:**
1. Click user menu
2. Toggle "Dark Mode" switch

**Note:** Your preference is saved automatically

---

## 🔐 Authentication & Security

### I forgot my password. What now?

**Steps:**
1. Go to login page
2. Click "Quên mật khẩu?"
3. Enter your email
4. Check email inbox
5. Click reset link
6. Enter new password
7. Login with new password

**Email not received?**
- Check spam folder
- Verify email address is correct
- Wait 5 minutes and try again
- Contact admin if still not working

---

### How long is the login session?

**Default: 60 minutes**

After 60 minutes of inactivity:
- Token expires
- You'll be logged out
- Need to login again

**To extend:**
Edit `appsettings.json`:
```json
"Jwt": {
  "ExpireMinutes": 120
}
```

---

### Is my data secure?

**Yes! We implement:**
- ✅ JWT token authentication
- ✅ Password hashing (BCrypt)
- ✅ HTTPS encryption
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Input validation

**Best practices:**
- Use strong passwords
- Enable email verification
- Regular backups
- Update dependencies
- Use HTTPS in production

---

### Can I have multiple users?

**Yes!**
- ✅ Unlimited users
- ✅ Two roles: Admin and Staff
- ✅ Role-based permissions

**Admin can:**
- Manage users
- Manage all data
- View analytics
- System configuration

**Staff can:**
- Manage products
- Manage orders
- Manage tables
- View limited analytics

---

## 🎨 Features & Functionality

### Does it support multiple languages?

**Currently:** Vietnamese only

**Planned:** English, Thai, Korean (v3.0)

**Workaround:** You can manually translate UI strings in code

---

### Can I export data?

**Currently:** No built-in export

**Planned (v3.0):**
- PDF export
- Excel export
- CSV export

**Workaround:** Query database directly

---

### Does it work offline?

**No.** Requires internet connection.

**Planned (v4.0):**
- Offline mode
- Sync when online

---

### Can I print receipts?

**Not yet.** Planned for v3.0

**Current workaround:**
- Use browser print (Ctrl+P)
- Create custom print view
- Use third-party receipt printer integration

---

### Does it support multiple restaurants?

**No.** Single restaurant instance.

**Planned (v3.0):**
- Multi-tenant support
- Branch management

**Current workaround:**
- Deploy separate instances
- Use different databases

---

### Can I customize the UI?

**Yes!**

**Easy customizations:**
```css
/* Edit styles/theme.css */
:root {
  --bun-brown: #YOUR_COLOR;
  --bun-yellow: #YOUR_COLOR;
}
```

**Advanced customizations:**
- Modify React components
- Change layouts
- Add new features
- Custom branding

---

## 🔧 Troubleshooting

### Frontend won't start

**Check:**
```bash
# 1. Node version
node --version  # Should be >= 18.0.0

# 2. Clear cache
rm -rf node_modules package-lock.json
npm install

# 3. Clear Vite cache
rm -rf .vite

# 4. Check port 5173
# Close other apps using port 5173

# 5. Try different port
npm run dev -- --port 3000
```

---

### Backend won't start

**Check:**
```bash
# 1. .NET version
dotnet --version  # Should be 8.0

# 2. Restore packages
dotnet restore

# 3. Build project
dotnet build

# 4. Check database connection
# Verify SQL Server is running

# 5. Check port 5000
netstat -ano | findstr :5000
```

---

### Database migration errors

**Solutions:**

**1. Delete and recreate:**
```bash
cd RestaurantPOS.API

# Delete migrations
rm -rf Migrations

# Create new migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

**2. Drop database:**
```bash
dotnet ef database drop -f
dotnet ef database update
```

---

### API returns 401 Unauthorized

**Causes:**
1. Token expired (login again)
2. Invalid token
3. Missing Authorization header

**Fix:**
```typescript
// Check token in localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);

// Login again
// Token will be refreshed
```

---

### Dark mode not working

**Solutions:**

**1. Hard refresh:**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**2. Clear cache:**
```
Browser Settings → Clear browsing data → Cached images and files
```

**3. Check localStorage:**
```javascript
// In browser console
localStorage.getItem('theme')  // Should be 'light' or 'dark'
```

---

### Products not loading

**Check:**

**1. Backend running:**
```bash
# Should see: Now listening on: http://localhost:5000
```

**2. Network tab (F12):**
- Look for /api/products request
- Check response status
- Check response data

**3. Console errors:**
- Open DevTools (F12)
- Check Console tab for errors

**4. Database:**
```sql
SELECT * FROM Products;
```

---

## ⚡ Performance & Optimization

### Application is slow. How to optimize?

**Frontend:**
```typescript
// 1. Use React.memo for expensive components
const ProductCard = React.memo(({ product }) => {
  // Component
});

// 2. Use useMemo for calculations
const total = useMemo(() => 
  items.reduce((sum, item) => sum + item.price, 0),
  [items]
);

// 3. Lazy load components
const Analytics = React.lazy(() => import('./Analytics'));
```

**Backend:**
```csharp
// 1. Add indexes
modelBuilder.Entity<Product>()
    .HasIndex(p => p.CategoryId);

// 2. Use Select for DTOs
var products = await _context.Products
    .Select(p => new ProductDto { ... })
    .ToListAsync();

// 3. Enable caching
services.AddResponseCaching();
```

---

### Database is slow

**Optimization tips:**

**1. Add indexes:**
```sql
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
```

**2. Analyze queries:**
```sql
-- View execution plan
SET SHOWPLAN_ALL ON;
SELECT * FROM Products WHERE CategoryId = 1;
```

**3. Update statistics:**
```sql
UPDATE STATISTICS Products;
UPDATE STATISTICS Orders;
```

---

### Too many API calls

**Solutions:**

**1. Debounce search:**
```typescript
const debouncedSearch = useMemo(
  () => debounce((term) => search(term), 300),
  []
);
```

**2. Cache results:**
```typescript
const [cache, setCache] = useState({});

const fetchData = async (key) => {
  if (cache[key]) return cache[key];
  const data = await api.get(key);
  setCache({ ...cache, [key]: data });
  return data;
};
```

**3. Pagination:**
```typescript
// Load data in chunks
const fetchProducts = async (page = 1, pageSize = 10) => {
  await api.get(`/products?page=${page}&pageSize=${pageSize}`);
};
```

---

## 🚀 Deployment

### How do I deploy to production?

**See:** [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide

**Quick steps:**

**Frontend (Netlify):**
1. Build: `npm run build`
2. Upload `dist/` folder
3. Configure redirects

**Backend (Azure):**
1. Publish: `dotnet publish -c Release`
2. Deploy to App Service
3. Configure connection strings

---

### Environment variables not working

**Frontend (.env):**
```env
# Must start with VITE_
VITE_API_BASE_URL=https://api.example.com
```

**Access in code:**
```typescript
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

**Backend (appsettings.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "..."
  }
}
```

---

### CORS errors in production

**Fix backend:**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production",
        builder => builder
            .WithOrigins("https://yourfrontend.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

app.UseCors("Production");
```

---

## 🤝 Contributing

### How can I contribute?

**Many ways:**
1. 🐛 Report bugs
2. 💡 Suggest features
3. 📝 Improve documentation
4. 💻 Submit code
5. ⭐ Star the repo

**See:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

### I found a bug. What now?

**Steps:**
1. Check if already reported
2. Create issue on GitHub
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots
   - Environment details

---

### Can I request a feature?

**Yes!**

1. Create issue with label `enhancement`
2. Describe feature
3. Explain use case
4. Wait for discussion
5. Implement (or someone else will)

---

## 📞 Still Have Questions?

**Contact us:**
- 📧 Email: support@bundaumet.com
- 💬 GitHub Discussions
- 🐛 GitHub Issues
- 📖 Full Documentation: `/doc`

---

**Didn't find your answer? [Create an issue](https://github.com/HUYVESEA0/RestaurantPOS-System/issues) with label `question`**

---

**Last Updated:** January 15, 2024  
**Version:** 2.0.0
