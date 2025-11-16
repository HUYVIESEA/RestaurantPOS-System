# 🗄️ Database Schema - Restaurant POS System

**Version:** 2.0.0  
**Database:** SQL Server 2019+  
**Last Updated:** January 15, 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [ER Diagram](#er-diagram)
3. [Tables](#tables)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Constraints](#constraints)
7. [Sample Data](#sample-data)
8. [Migrations](#migrations)

---

## 🎯 Overview

The Restaurant POS database consists of 6 main tables:
- **Users** - System users (Admin, Staff)
- **Products** - Menu items
- **Categories** - Product categories
- **Tables** - Restaurant tables
- **Orders** - Customer orders
- **OrderItems** - Order details

---

## 📊 ER Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Users     │       │  Categories  │       │   Tables    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ UserId (PK) │       │ CategoryId   │       │ TableId (PK)│
│ FullName    │       │ Name         │       │ TableNumber │
│ Email       │       │ Description  │       │ Capacity    │
│ Username    │       │ DisplayOrder │       │ Floor       │
│ Password    │       └──────────────┘       │ IsAvailable │
│ Role        │              │               └─────────────┘
│ IsActive    │              │                      │
└─────────────┘              │                      │
                             │                      │
                             ↓                      │
                    ┌──────────────┐                │
                    │   Products   │                │
                    ├──────────────┤                │
                    │ ProductId    │                │
                    │ Name         │                │
                    │ Description  │                │
                    │ Price        │                │
                    │ CategoryId   │────────────────┘
                    │ ImageUrl     │
                    │ IsAvailable  │
                    └──────────────┘
                            │
                            │
                            ↓
                    ┌──────────────┐       ┌──────────────┐
                    │  OrderItems  │───────│   Orders     │
                    ├──────────────┤       ├──────────────┤
                    │ OrderItemId  │       │ OrderId (PK) │
                    │ OrderId (FK) │       │ TableId (FK) │
                    │ ProductId    │       │ OrderDate    │
                    │ Quantity     │       │ Status       │
                    │ UnitPrice    │       │ TotalAmount  │
                    │ Subtotal     │       │ Notes        │
                    └──────────────┘       │ CreatedBy    │
                                           └──────────────┘
```

---

## 📁 Tables

### 1. Users

**Purpose:** Store user accounts (Admin and Staff)

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `UserId` | int | No | IDENTITY | Primary key |
| `FullName` | nvarchar(100) | No | - | Full name |
| `Email` | nvarchar(100) | No | - | Email address (unique) |
| `Username` | nvarchar(50) | No | - | Login username (unique) |
| `PasswordHash` | nvarchar(255) | No | - | BCrypt hashed password |
| `Role` | nvarchar(20) | No | - | Admin or Staff |
| `PhoneNumber` | nvarchar(20) | Yes | NULL | Contact number |
| `IsActive` | bit | No | 1 | Account status |
| `EmailVerified` | bit | No | 0 | Email verification status |
| `VerificationToken` | nvarchar(255) | Yes | NULL | Email verification token |
| `ResetPasswordToken` | nvarchar(255) | Yes | NULL | Password reset token |
| `ResetPasswordExpires` | datetime | Yes | NULL | Token expiration |
| `CreatedAt` | datetime | No | GETDATE() | Creation timestamp |
| `UpdatedAt` | datetime | Yes | NULL | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);
CREATE UNIQUE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Role ON Users(Role);
```

**Constraints:**
```sql
CHECK (Role IN ('Admin', 'Staff'))
CHECK (Email LIKE '%@%.%')
```

---

### 2. Categories

**Purpose:** Organize products into categories

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `CategoryId` | int | No | IDENTITY | Primary key |
| `Name` | nvarchar(100) | No | - | Category name (unique) |
| `Description` | nvarchar(500) | Yes | NULL | Category description |
| `DisplayOrder` | int | No | 0 | Sort order |
| `CreatedAt` | datetime | No | GETDATE() | Creation timestamp |
| `UpdatedAt` | datetime | Yes | NULL | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX IX_Categories_Name ON Categories(Name);
CREATE INDEX IX_Categories_DisplayOrder ON Categories(DisplayOrder);
```

---

### 3. Products

**Purpose:** Store menu items/products

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `ProductId` | int | No | IDENTITY | Primary key |
| `Name` | nvarchar(200) | No | - | Product name |
| `Description` | nvarchar(1000) | Yes | NULL | Product description |
| `Price` | decimal(18,0) | No | - | Price in VND |
| `CategoryId` | int | No | - | Foreign key to Categories |
| `ImageUrl` | nvarchar(500) | Yes | NULL | Product image path |
| `IsAvailable` | bit | No | 1 | Availability status |
| `CreatedAt` | datetime | No | GETDATE() | Creation timestamp |
| `UpdatedAt` | datetime | Yes | NULL | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Products_Name ON Products(Name);
CREATE INDEX IX_Products_IsAvailable ON Products(IsAvailable);
```

**Foreign Keys:**
```sql
ALTER TABLE Products ADD CONSTRAINT FK_Products_Categories 
  FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId);
```

---

### 4. Tables

**Purpose:** Restaurant tables management

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `TableId` | int | No | IDENTITY | Primary key |
| `TableNumber` | nvarchar(20) | No | - | Table identifier (unique) |
| `Capacity` | int | No | - | Number of seats |
| `Floor` | int | No | 1 | Floor number |
| `IsAvailable` | bit | No | 1 | Availability status |
| `CreatedAt` | datetime | No | GETDATE() | Creation timestamp |
| `UpdatedAt` | datetime | Yes | NULL | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX IX_Tables_TableNumber ON Tables(TableNumber);
CREATE INDEX IX_Tables_IsAvailable ON Tables(IsAvailable);
CREATE INDEX IX_Tables_Floor ON Tables(Floor);
```

**Constraints:**
```sql
CHECK (Capacity > 0)
CHECK (Floor > 0)
```

---

### 5. Orders

**Purpose:** Customer orders

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `OrderId` | int | No | IDENTITY | Primary key |
| `TableId` | int | No | - | Foreign key to Tables |
| `OrderDate` | datetime | No | GETDATE() | Order timestamp |
| `Status` | nvarchar(20) | No | 'Pending' | Order status |
| `TotalAmount` | decimal(18,0) | No | 0 | Total order amount |
| `Notes` | nvarchar(1000) | Yes | NULL | Special instructions |
| `CreatedBy` | int | No | - | Foreign key to Users |
| `CreatedAt` | datetime | No | GETDATE() | Creation timestamp |
| `UpdatedAt` | datetime | Yes | NULL | Last update timestamp |
| `CompletedAt` | datetime | Yes | NULL | Completion timestamp |

**Indexes:**
```sql
CREATE INDEX IX_Orders_TableId ON Orders(TableId);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
CREATE INDEX IX_Orders_CreatedBy ON Orders(CreatedBy);
```

**Foreign Keys:**
```sql
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Tables 
  FOREIGN KEY (TableId) REFERENCES Tables(TableId);
  
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Users 
  FOREIGN KEY (CreatedBy) REFERENCES Users(UserId);
```

**Constraints:**
```sql
CHECK (Status IN ('Pending', 'Completed', 'Cancelled'))
CHECK (TotalAmount >= 0)
```

---

### 6. OrderItems

**Purpose:** Order line items (products in orders)

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `OrderItemId` | int | No | IDENTITY | Primary key |
| `OrderId` | int | No | - | Foreign key to Orders |
| `ProductId` | int | No | - | Foreign key to Products |
| `Quantity` | int | No | - | Item quantity |
| `UnitPrice` | decimal(18,0) | No | - | Price at order time |
| `Subtotal` | decimal(18,0) | No | - | Quantity × UnitPrice |
| `Notes` | nvarchar(500) | Yes | NULL | Item notes |

**Indexes:**
```sql
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);
```

**Foreign Keys:**
```sql
ALTER TABLE OrderItems ADD CONSTRAINT FK_OrderItems_Orders 
  FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE;
  
ALTER TABLE OrderItems ADD CONSTRAINT FK_OrderItems_Products 
  FOREIGN KEY (ProductId) REFERENCES Products(ProductId);
```

**Constraints:**
```sql
CHECK (Quantity > 0)
CHECK (UnitPrice >= 0)
CHECK (Subtotal >= 0)
```

---

## 🔗 Relationships

### One-to-Many Relationships

**Categories → Products**
- One category has many products
- One product belongs to one category
- Cannot delete category with products

**Tables → Orders**
- One table has many orders
- One order belongs to one table
- Cannot delete table with active orders

**Users → Orders**
- One user creates many orders
- One order created by one user
- Cannot delete user with orders

**Orders → OrderItems**
- One order has many order items
- One order item belongs to one order
- Cascade delete: deleting order deletes items

**Products → OrderItems**
- One product appears in many order items
- One order item references one product
- Cannot delete product with order items

---

## 📇 Indexes

### Primary Keys (Clustered Indexes)
```sql
PK_Users: UserId
PK_Categories: CategoryId
PK_Products: ProductId
PK_Tables: TableId
PK_Orders: OrderId
PK_OrderItems: OrderItemId
```

### Unique Indexes
```sql
IX_Users_Email
IX_Users_Username
IX_Categories_Name
IX_Tables_TableNumber
```

### Non-Clustered Indexes
```sql
IX_Users_Role
IX_Products_CategoryId
IX_Products_IsAvailable
IX_Tables_IsAvailable
IX_Orders_Status
IX_Orders_OrderDate
IX_OrderItems_OrderId
IX_OrderItems_ProductId
```

---

## ✅ Constraints

### Check Constraints
```sql
CK_Users_Role: Role IN ('Admin', 'Staff')
CK_Users_Email: Email LIKE '%@%.%'
CK_Tables_Capacity: Capacity > 0
CK_Tables_Floor: Floor > 0
CK_Orders_Status: Status IN ('Pending', 'Completed', 'Cancelled')
CK_Orders_TotalAmount: TotalAmount >= 0
CK_OrderItems_Quantity: Quantity > 0
CK_OrderItems_UnitPrice: UnitPrice >= 0
```

### Foreign Key Constraints
```sql
FK_Products_Categories
FK_Orders_Tables
FK_Orders_Users
FK_OrderItems_Orders (CASCADE DELETE)
FK_OrderItems_Products
```

---

## 📝 Sample Data

### Users
```sql
INSERT INTO Users (FullName, Email, Username, PasswordHash, Role, PhoneNumber, IsActive, EmailVerified)
VALUES 
('Administrator', 'admin@bundaumet.com', 'admin', '$2a$...', 'Admin', '0123456789', 1, 1),
('Staff User', 'staff@bundaumet.com', 'staff', '$2a$...', 'Staff', '0987654321', 1, 1);
```

### Categories
```sql
INSERT INTO Categories (Name, Description, DisplayOrder)
VALUES 
('Món Chính', 'Các món ăn chính', 1),
('Đồ Uống', 'Nước giải khát', 2),
('Tráng Miệng', 'Món tráng miệng', 3);
```

### Products
```sql
INSERT INTO Products (Name, Description, Price, CategoryId, IsAvailable)
VALUES 
('Bún Đậu Mắm Tôm', 'Đặc sản Hà Nội', 45000, 1, 1),
('Chả Cốm', 'Đặc sản cốm Vòng', 35000, 1, 1),
('Trà Đá', 'Trà đá tự nhiên', 5000, 2, 1);
```

### Tables
```sql
INSERT INTO Tables (TableNumber, Capacity, Floor, IsAvailable)
VALUES 
('T01', 4, 1, 1),
('T02', 6, 1, 1),
('T03', 2, 2, 1);
```

---

## 🔄 Migrations

### Initial Migration
```sql
-- Create tables
CREATE TABLE Users (...);
CREATE TABLE Categories (...);
CREATE TABLE Products (...);
CREATE TABLE Tables (...);
CREATE TABLE Orders (...);
CREATE TABLE OrderItems (...);

-- Add constraints
ALTER TABLE Products ADD CONSTRAINT FK_Products_Categories ...;
ALTER TABLE Orders ADD CONSTRAINT FK_Orders_Tables ...;
-- etc.

-- Create indexes
CREATE INDEX IX_Products_CategoryId ...;
-- etc.
```

### Migration History
- `20240101_InitialCreate` - Initial database schema
- `20240102_AddEmailVerification` - Add email verification fields
- `20240103_AddPasswordReset` - Add password reset tokens
- `20240115_UpdatePriceFormat` - Change price to decimal(18,0)

---

## 🛠️ Maintenance

### Backup Strategy
```sql
-- Full backup daily
BACKUP DATABASE RestaurantPOS 
TO DISK = 'C:\Backup\RestaurantPOS_Full.bak'
WITH COMPRESSION;

-- Transaction log backup hourly
BACKUP LOG RestaurantPOS 
TO DISK = 'C:\Backup\RestaurantPOS_Log.trn';
```

### Index Maintenance
```sql
-- Rebuild indexes weekly
ALTER INDEX ALL ON Users REBUILD;
ALTER INDEX ALL ON Products REBUILD;
ALTER INDEX ALL ON Orders REBUILD;
```

### Statistics Update
```sql
-- Update statistics daily
UPDATE STATISTICS Users;
UPDATE STATISTICS Products;
UPDATE STATISTICS Orders;
```

---

## 📊 Performance Tips

1. **Use appropriate indexes** for frequently queried columns
2. **Avoid SELECT *** - specify columns
3. **Use pagination** for large result sets
4. **Cache frequently accessed data** (categories, products)
5. **Monitor slow queries** with SQL Profiler
6. **Regular index maintenance**
7. **Keep statistics up to date**

---

## 🔍 Common Queries

### Get products with category
```sql
SELECT p.*, c.Name AS CategoryName
FROM Products p
INNER JOIN Categories c ON p.CategoryId = c.CategoryId
WHERE p.IsAvailable = 1;
```

### Get orders with details
```sql
SELECT o.*, t.TableNumber, u.FullName AS CreatedByName
FROM Orders o
INNER JOIN Tables t ON o.TableId = t.TableId
INNER JOIN Users u ON o.CreatedBy = u.UserId
WHERE o.Status = 'Pending';
```

### Get order items with product info
```sql
SELECT oi.*, p.Name AS ProductName
FROM OrderItems oi
INNER JOIN Products p ON oi.ProductId = p.ProductId
WHERE oi.OrderId = @OrderId;
```

---

**Version:** 2.0.0  
**Last Updated:** January 15, 2024  
**Maintained by:** Restaurant POS Team
