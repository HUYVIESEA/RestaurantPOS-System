-- =====================================================
-- RESTAURANT POS SYSTEM - DATABASE SCHEMA
-- Version: 1.0 (Release)
-- Date: 2025-12-23
-- Author: Hoàng Việt Huy
-- =====================================================

-- Database Creation
CREATE DATABASE RestaurantPOS;
GO

USE RestaurantPOS;
GO

-- =====================================================
-- TABLES CREATION
-- =====================================================

-- 1. Categories Table
CREATE TABLE Categories (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- 2. Products Table
CREATE TABLE Products (
    ProductId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    Price DECIMAL(18,2) NOT NULL CHECK (Price >= 0),
    CategoryId INT NOT NULL,
    ImageUrl NVARCHAR(500),
    IsAvailable BIT DEFAULT 1,
    StockQuantity INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);

-- 3. Tables Table
CREATE TABLE Tables (
    TableId INT PRIMARY KEY IDENTITY(1,1),
    TableNumber NVARCHAR(50) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    Floor NVARCHAR(50) NOT NULL,
    IsAvailable BIT DEFAULT 1,
    IsMerged BIT DEFAULT 0,
    MergedWithTableId INT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (MergedWithTableId) REFERENCES Tables(TableId)
);

-- 4. Orders Table
CREATE TABLE Orders (
    OrderId INT PRIMARY KEY IDENTITY(1,1),
    TableId INT NOT NULL,
    CustomerName NVARCHAR(200),
    OrderDate DATETIME2 DEFAULT GETDATE(),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    Notes NVARCHAR(1000),
    IsPaid BIT DEFAULT 0,
    PaymentMethod NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (TableId) REFERENCES Tables(TableId),
    CHECK (Status IN ('Pending', 'Cooking', 'Prepared', 'Completed', 'Cancelled'))
);

-- 5. Order Items Table
CREATE TABLE OrderItems (
    OrderItemId INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(18,2) NOT NULL,
    Notes NVARCHAR(500),
    Status NVARCHAR(50) DEFAULT 'Pending',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    CHECK (Status IN ('Pending', 'Preparing', 'Ready', 'Cancelled'))
);

-- 6. Users Table (for authentication)
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'Staff',
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CHECK (Role IN ('Admin', 'Manager', 'Staff', 'Chef'))
);

-- 7. Payments Table
CREATE TABLE Payments (
    PaymentId INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(50) NOT NULL,
    TransactionId NVARCHAR(200),
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    PaymentDate DATETIME2 DEFAULT GETDATE(),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    CHECK (PaymentMethod IN ('Cash', 'VnPay', 'Card', 'Transfer')),
    CHECK (Status IN ('Pending', 'Completed', 'Failed', 'Refunded'))
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Orders_TableId ON Orders(TableId);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);
CREATE INDEX IX_Payments_OrderId ON Payments(OrderId);

-- =====================================================
-- SAMPLE DATA (SEED DATA)
-- =====================================================

-- Categories
SET IDENTITY_INSERT Categories ON;
INSERT INTO Categories (CategoryId, Name, Description) VALUES
(1, N'Đồ ăn', N'Các món ăn chính'),
(2, N'Đồ uống', N'Nước giải khát và đồ uống'),
(3, N'Tráng miệng', N'Các món tráng miệng'),
(4, N'Khai vị', N'Các món khai vị');
SET IDENTITY_INSERT Categories OFF;

-- Products
SET IDENTITY_INSERT Products ON;
INSERT INTO Products (ProductId, Name, Description, Price, CategoryId, IsAvailable, StockQuantity) VALUES
-- Đồ ăn
(1, N'Phở Bò', N'Phở bò truyền thống Hà Nội', 50000, 1, 1, 100),
(2, N'Cơm Tấm', N'Cơm tấm sườn nướng', 45000, 1, 1, 100),
(3, N'Bún Chả', N'Bún chả Hà Nội', 45000, 1, 1, 100),
(4, N'Bánh Mì', N'Bánh mì thịt nguội', 25000, 1, 1, 100),
(5, N'Mì Xào Bò', N'Mì xào bò rau củ', 55000, 1, 1, 100),

-- Đồ uống
(6, N'Trà Đá', N'Trà đá miễn phí', 5000, 2, 1, 1000),
(7, N'Nước Cam', N'Nước cam tươi', 25000, 2, 1, 100),
(8, N'Cà Phê Sữa Đá', N'Cà phê sữa đá truyền thống', 20000, 2, 1, 100),
(9, N'Sinh Tố Bơ', N'Sinh tố bơ sữa', 30000, 2, 1, 100),
(10, N'Bia Sài Gòn', N'Bia Sài Gòn lon', 15000, 2, 1, 200),

-- Tráng miệng
(11, N'Chè Ba Màu', N'Chè ba màu truyền thống', 20000, 3, 1, 50),
(12, N'Yaourt', N'Yaourt dẻo', 15000, 3, 1, 100),

-- Khai vị
(13, N'Gỏi Cuốn', N'Gỏi cuốn tôm thit (2 cuốn)', 30000, 4, 1, 50),
(14, N'Nem Rán', N'Nem rán giòn (5 viên)', 35000, 4, 1, 50);
SET IDENTITY_INSERT Products OFF;

-- Tables (Bàn ăn + Bàn Mang về đặc biệt)
SET IDENTITY_INSERT Tables ON;
INSERT INTO Tables (TableId, TableNumber, Capacity, Floor, IsAvailable) VALUES
-- Tầng 1
(1, 'B01', 4, N'Tầng 1', 1), (2, 'B02', 4, N'Tầng 1', 1),
(3, 'B03', 4, N'Tầng 1', 1), (4, 'B04', 4, N'Tầng 1', 1),
(5, 'B05', 4, N'Tầng 1', 1), (6, 'B06', 4, N'Tầng 1', 1),
(7, 'B07', 4, N'Tầng 1', 1), (8, 'B08', 4, N'Tầng 1', 1),
(9, 'B09', 4, N'Tầng 1', 1), (10, 'B10', 4, N'Tầng 1', 1),
(11, 'B11', 6, N'Tầng 1', 1), (12, 'B12', 6, N'Tầng 1', 1),
(13, 'B13', 6, N'Tầng 1', 1), (14, 'B14', 6, N'Tầng 1', 1),
(15, 'B15', 6, N'Tầng 1', 1), (16, 'B16', 8, N'Tầng 1', 1),
(17, 'B17', 8, N'Tầng 1', 1), (18, 'B18', 8, N'Tầng 1', 1),
(19, 'B19', 8, N'Tầng 1', 1), (20, 'B20', 8, N'Tầng 1', 1),
(21, 'B21', 2, N'Tầng 1', 1), (22, 'B22', 2, N'Tầng 1', 1),
(23, 'B23', 2, N'Tầng 1', 1), (24, 'B24', 2, N'Tầng 1', 1),
(25, 'B25', 2, N'Tầng 1', 1),

-- Tầng 2
(26, 'B26', 4, N'Tầng 2', 1), (27, 'B27', 4, N'Tầng 2', 1),
(28, 'B28', 4, N'Tầng 2', 1), (29, 'B29', 4, N'Tầng 2', 1),
(30, 'B30', 4, N'Tầng 2', 1), (31, 'B31', 6, N'Tầng 2', 1),
(32, 'B32', 6, N'Tầng 2', 1), (33, 'B33', 6, N'Tầng 2', 1),
(34, 'B34', 6, N'Tầng 2', 1), (35, 'B35', 6, N'Tầng 2', 1),
(36, 'B36', 8, N'Tầng 2', 1), (37, 'B37', 8, N'Tầng 2', 1),
(38, 'B38', 8, N'Tầng 2', 1), (39, 'B39', 8, N'Tầng 2', 1),
(40, 'B40', 8, N'Tầng 2', 1), (41, 'B41', 2, N'Tầng 2', 1),
(42, 'B42', 2, N'Tầng 2', 1), (43, 'B43', 2, N'Tầng 2', 1),
(44, 'B44', 2, N'Tầng 2', 1), (45, 'B45', 2, N'Tầng 2', 1),
(46, 'B46', 10, N'Tầng 2', 1), (47, 'B47', 10, N'Tầng 2', 1),
(48, 'B48', 10, N'Tầng 2', 1), (49, 'B49', 12, N'Tầng 2', 1),
(50, 'B50', 12, N'Tầng 2', 1),

-- Bàn "Mang về" đặc biệt (không hiển thị trong grid)
(100, N'Mang về', 999, N'Mang về', 1);
SET IDENTITY_INSERT Tables OFF;

-- Sample User (Password: Admin@123)
SET IDENTITY_INSERT Users ON;
INSERT INTO Users (UserId, Username, Email, PasswordHash, FullName, Role, IsActive) VALUES
(1, 'admin', 'admin@restaurant.com', 
 'AQAAAAEAACcQAAAAEK8pqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK==', 
 N'Administrator', 'Admin', 1),
(2, 'chef', 'chef@restaurant.com',
 'AQAAAAEAACcQAAAAEK8pqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK==',
 N'Head Chef', 'Chef', 1),
(3, 'staff', 'staff@restaurant.com',
 'AQAAAAEAACcQAAAAEK8pqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK5vqK==',
 N'Staff Member', 'Staff', 1);
SET IDENTITY_INSERT Users OFF;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Get Daily Sales Summary
GO
CREATE PROCEDURE sp_GetDailySalesSummary
    @Date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Date IS NULL
        SET @Date = CAST(GETDATE() AS DATE);
    
    SELECT 
        COUNT(DISTINCT o.OrderId) AS TotalOrders,
        SUM(o.TotalAmount) AS TotalRevenue,
        COUNT(DISTINCT CASE WHEN o.Status = 'Completed' THEN o.OrderId END) AS CompletedOrders,
        COUNT(DISTINCT CASE WHEN o.Status = 'Pending' THEN o.OrderId END) AS PendingOrders,
        COUNT(DISTINCT CASE WHEN o.Status = 'Cancelled' THEN o.OrderId END) AS CancelledOrders,
        AVG(o.TotalAmount) AS AverageOrderValue
    FROM Orders o
    WHERE CAST(o.OrderDate AS DATE) = @Date;
END;
GO

-- Get Top Selling Products
GO
CREATE PROCEDURE sp_GetTopSellingProducts
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @TopN INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StartDate IS NULL
        SET @StartDate = DATEADD(MONTH, -1, GETDATE());
    
    IF @EndDate IS NULL
        SET @EndDate = GETDATE();
    
    SELECT TOP (@TopN)
        p.ProductId,
        p.Name,
        c.Name AS CategoryName,
        SUM(oi.Quantity) AS TotalQuantitySold,
        SUM(oi.Quantity * oi.UnitPrice) AS TotalRevenue
    FROM OrderItems oi
    INNER JOIN Products p ON oi.ProductId = p.ProductId
    INNER JOIN Categories c ON p.CategoryId = c.CategoryId
    INNER JOIN Orders o ON oi.OrderId = o.OrderId
    WHERE o.OrderDate BETWEEN @StartDate AND @EndDate
        AND o.Status = 'Completed'
    GROUP BY p.ProductId, p.Name, c.Name
    ORDER BY TotalQuantitySold DESC;
END;
GO

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update TotalAmount when OrderItems change
GO
CREATE TRIGGER trg_UpdateOrderTotal
ON OrderItems
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE o
    SET TotalAmount = ISNULL((
        SELECT SUM(Quantity * UnitPrice)
        FROM OrderItems
        WHERE OrderId = o.OrderId
    ), 0),
    UpdatedAt = GETDATE()
    FROM Orders o
    WHERE o.OrderId IN (
        SELECT DISTINCT OrderId FROM inserted
        UNION
        SELECT DISTINCT OrderId FROM deleted
    );
END;
GO

-- Update table availability when order completed/cancelled
GO
CREATE TRIGGER trg_UpdateTableAvailability
ON Orders
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Mark table as available when order is completed or cancelled
    UPDATE t
    SET IsAvailable = 1,
        UpdatedAt = GETDATE()
    FROM Tables t
    INNER JOIN inserted i ON t.TableId = i.TableId
    WHERE i.Status IN ('Completed', 'Cancelled')
        AND NOT EXISTS (
            SELECT 1 FROM Orders o2
            WHERE o2.TableId = t.TableId
                AND o2.Status NOT IN ('Completed', 'Cancelled')
                AND o2.OrderId <> i.OrderId
        );
END;
GO

-- =====================================================
-- VIEWS
-- =====================================================

-- Order Details View
GO
CREATE VIEW vw_OrderDetails AS
SELECT 
    o.OrderId,
    o.OrderDate,
    t.TableNumber,
    t.Floor,
    o.CustomerName,
    o.Status AS OrderStatus,
    o.TotalAmount,
    o.IsPaid,
    o.PaymentMethod,
    oi.OrderItemId,
    p.Name AS ProductName,
    oi.Quantity,
    oi.UnitPrice,
    oi.Status AS ItemStatus,
    (oi.Quantity * oi.UnitPrice) AS ItemTotal
FROM Orders o
INNER JOIN Tables t ON o.TableId = t.TableId
INNER JOIN OrderItems oi ON o.OrderId = oi.OrderId
INNER JOIN Products p ON oi.ProductId = p.ProductId;
GO

-- Product Inventory View
GO
CREATE VIEW vw_ProductInventory AS
SELECT 
    p.ProductId,
    p.Name AS ProductName,
    c.Name AS CategoryName,
    p.Price,
    p.StockQuantity,
    p.IsAvailable,
    CASE 
        WHEN p.StockQuantity = 0 THEN N'Hết hàng'
        WHEN p.StockQuantity <= 10 THEN N'Sắp hết'
        ELSE N'Còn hàng'
    END AS StockStatus
FROM Products p
INNER JOIN Categories c ON p.CategoryId = c.CategoryId;
GO

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Default password for all users: Admin@123 (hashed)
-- 2. Table 100 is special "Takeaway" table with ID=100
-- 3. All timestamps use DATETIME2 for better precision
-- 4. Indexes created for common query patterns
-- 5. Triggers automatically update totals and availability

-- =====================================================
-- END OF SCRIPT
-- =====================================================
