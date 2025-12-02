---
description: Quản lý database migrations với Entity Framework Core
---

# Database Migration

Workflow này hướng dẫn quản lý database migrations cho RestaurantPOS System.

## Prerequisites

1. Đã cài .NET SDK 8.0+
2. Đã cài EF Core CLI tools

**Cài đặt EF Core Tools:**
```powershell
dotnet tool install --global dotnet-ef
```

**Verify:**
```powershell
dotnet ef --version
```

## Database Information

**Database Type:** SQLite  
**Database File:** `restaurant_pos.db`  
**Location:** `RestaurantPOS.API/`

## Common Operations

### 1. View Current Migration Status

```powershell
cd RestaurantPOS.API
dotnet ef migrations list
```

### 2. Create New Migration

**Khi thay đổi Models:**
```powershell
dotnet ef migrations add MigrationName --context AppDbContext
```

**Ví dụ:**
```powershell
# Thêm bảng mới
dotnet ef migrations add AddCustomerTable

# Thêm column mới
dotnet ef migrations add AddPhoneNumberToUser

# Sửa quan hệ
dotnet ef migrations add UpdateOrderRelationships
```

**Best Practices cho migration names:**
- Dùng PascalCase
- Mô tả rõ ràng thay đổi
- Dùng động từ: Add, Update, Remove, Create
- Ví dụ: `AddEmailToCustomer`, `RemoveOldTable`

### 3. Apply Migration

**Update database lên latest migration:**
```powershell
dotnet ef database update
```

**Update đến migration cụ thể:**
```powershell
dotnet ef database update MigrationName
```

**Rollback về migration trước:**
```powershell
dotnet ef database update PreviousMigrationName
```

**Rollback tất cả (về database trống):**
```powershell
dotnet ef database update 0
```

### 4. Remove Migration

**Remove migration chưa apply:**
```powershell
dotnet ef migrations remove
```

**LƯU Ý:** Chỉ remove được migration cuối cùng chưa được apply.

### 5. Generate SQL Script

**Script cho tất cả migrations:**
```powershell
dotnet ef migrations script > migrations.sql
```

**Script cho range migrations:**
```powershell
dotnet ef migrations script FromMigration ToMigration > migration.sql
```

**Script từ migration đến latest:**
```powershell
dotnet ef migrations script LastAppliedMigration > update.sql
```

## Migration Workflow

### Scenario 1: Thêm bảng mới

**1. Tạo Model:**
```csharp
// Models/Customer.cs
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**2. Thêm vào DbContext:**
```csharp
// Data/AppDbContext.cs
public DbSet<Customer> Customers { get; set; }
```

**3. Tạo migration:**
```powershell
dotnet ef migrations add AddCustomerTable
```

**4. Review generated migration:**
```powershell
# Kiểm tra file: Migrations/XXXXXX_AddCustomerTable.cs
```

**5. Apply migration:**
```powershell
dotnet ef database update
```

**6. Verify:**
```powershell
dotnet ef migrations list
# Hoặc dùng DB Browser for SQLite
```

### Scenario 2: Thêm column vào bảng có sẵn

**1. Update Model:**
```csharp
public class User
{
    // Existing properties...
    public string PhoneNumber { get; set; }  // NEW
}
```

**2. Create migration:**
```powershell
dotnet ef migrations add AddPhoneNumberToUser
```

**3. Apply:**
```powershell
dotnet ef database update
```

### Scenario 3: Rename column

**1. Update Model:**
```csharp
public class Product
{
    // Old: public string Name { get; set; }
    public string ProductName { get; set; }  // NEW
}
```

**2. Create migration:**
```powershell
dotnet ef migrations add RenameProductNameColumn
```

**3. Edit migration để rename thay vì drop/add:**
```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.RenameColumn(
        name: "Name",
        table: "Products",
        newName: "ProductName");
}
```

**4. Apply:**
```powershell
dotnet ef database update
```

### Scenario 4: Remove bảng

**1. Remove DbSet từ DbContext:**
```csharp
// Comment out hoặc xóa
// public DbSet<OldTable> OldTables { get; set; }
```

**2. Create migration:**
```powershell
dotnet ef migrations add RemoveOldTable
```

**3. Apply:**
```powershell
dotnet ef database update
```

## Database Seeding

### Seed dữ liệu ban đầu

**File:** `Data/DbInitializer.cs`

```csharp
public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        // Seed Categories
        if (!context.Categories.Any())
        {
            var categories = new Category[]
            {
                new Category { Name = "Món chính", Description = "..." },
                new Category { Name = "Đồ uống", Description = "..." }
            };
            context.Categories.AddRange(categories);
            context.SaveChanges();
        }
    }
}
```

**Gọi trong Program.cs:**
```csharp
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    DbInitializer.Initialize(context);
}
```

## Backup & Restore

### Backup Database

**Manual copy:**
```powershell
cp RestaurantPOS.API\restaurant_pos.db RestaurantPOS.API\restaurant_pos_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db
```

**Automated backup script:**
```powershell
# backup-db.ps1
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$source = "RestaurantPOS.API\restaurant_pos.db"
$dest = "backups\restaurant_pos_$timestamp.db"
Copy-Item $source $dest
Write-Host "Backup created: $dest"
```

### Restore Database

```powershell
# Dừng API server trước
cp backups\restaurant_pos_TIMESTAMP.db RestaurantPOS.API\restaurant_pos.db
```

## Troubleshooting

### Migration Failed

**Xem chi tiết lỗi:**
```powershell
dotnet ef database update --verbose
```

**Reset và thử lại:**
```powershell
# Xóa database
rm RestaurantPOS.API\restaurant_pos.db

# Apply lại từ đầu
dotnet ef database update
```

### Conflicts giữa Migrations

**Remove migration lỗi:**
```powershell
dotnet ef migrations remove
```

**Tạo lại:**
```powershell
dotnet ef migrations add FixedMigration
dotnet ef database update
```

### "No migrations" Error

**Check DbContext:**
```powershell
dotnet ef dbcontext info
```

**Rebuild project:**
```powershell
dotnet clean
dotnet build
```

### Database Locked

**Đóng tất cả connections:**
- Dừng API server
- Đóng Database browsers
- Retry migration

## Production Migration

### Trước khi deploy

**1. Generate SQL script:**
```powershell
dotnet ef migrations script --idempotent > production_migration.sql
```

**2. Review script:**
- Kiểm tra tất cả thay đổi
- Test trên staging database

**3. Backup production database:**
```powershell
# Backup trên server
```

**4. Apply migration:**
```powershell
# Option A: Chạy script
# Option B: Chạy dotnet ef database update
```

**5. Verify:**
```powershell
dotnet ef migrations list
```

## Best Practices

1. **Luôn backup trước khi migrate**
2. **Test migrations trên development/staging trước**
3. **Dùng descriptive names cho migrations**
4. **Review generated migration code**
5. **Không sửa migrations đã apply**
6. **Keep migration files trong source control**
7. **Document breaking changes**
8. **Use idempotent scripts cho production**

## Tools

### DB Browser for SQLite

Download: https://sqlitebrowser.org/

**Connect to database:**
- File → Open Database
- Chọn `restaurant_pos.db`
- Browse tables, run queries

### Visual Studio

**Package Manager Console:**
```powershell
Add-Migration MigrationName
Update-Database
```

## Next Steps

- Sau khi migrate, test application thoroughly
- Update API documentation nếu có thay đổi models
- Notify team về database changes
