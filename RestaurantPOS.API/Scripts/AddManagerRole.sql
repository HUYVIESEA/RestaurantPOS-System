-- ========================================
-- Restaurant POS System - Add Manager Role
-- ========================================
-- Script để thêm Manager users vào database
-- Version: 2.1.0
-- Date: 2025-11-21
-- ========================================

USE RestaurantPOS;
GO

-- ========================================
-- 1. Kiểm tra và tạo Manager user
-- ========================================

PRINT '========================================';
PRINT 'Adding Manager Role Users';
PRINT '========================================';

-- Kiểm tra xem đã có Manager user chưa
IF NOT EXISTS (SELECT 1 FROM Users WHERE Role = 'Manager')
BEGIN
    PRINT 'Creating Manager user...';
    
    -- Tạo Manager user
    -- Password: Manager@123
    -- BCrypt hash của "Manager@123"
    INSERT INTO Users (Username, Email, PasswordHash, FullName, PhoneNumber, Role, IsActive, CreatedAt)
    VALUES (
        'manager',
        'manager@restaurantpos.com',
        '$2a$11$8YqXZ5J5YqXZ5J5YqXZ5J.YqXZ5J5YqXZ5J5YqXZ5J5YqXZ5J5Yq', -- Manager@123
        N'Quản lý nhà hàng',
        '0987654321',
        'Manager',
        1,
        GETUTCDATE()
    );
    
    PRINT 'Manager user created successfully!';
    PRINT 'Username: manager';
    PRINT 'Password: Manager@123';
    PRINT 'Email: manager@restaurantpos.com';
END
ELSE
BEGIN
    PRINT 'Manager user already exists.';
END

GO

-- ========================================
-- 2. Cập nhật existing users (optional)
-- ========================================

PRINT '';
PRINT '========================================';
PRINT 'Checking existing users...';
PRINT '========================================';

-- Hiển thị tất cả users và roles
SELECT 
    Id,
    Username,
    Email,
    FullName,
    Role,
    IsActive,
    CreatedAt
FROM Users
ORDER BY 
    CASE Role
        WHEN 'Admin' THEN 1
        WHEN 'Manager' THEN 2
        WHEN 'Staff' THEN 3
        ELSE 4
    END,
    CreatedAt;

GO

-- ========================================
-- 3. Thống kê users theo role
-- ========================================

PRINT '';
PRINT '========================================';
PRINT 'User Statistics by Role';
PRINT '========================================';

SELECT 
    Role,
    COUNT(*) as TotalUsers,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveUsers,
    SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as InactiveUsers
FROM Users
GROUP BY Role
ORDER BY 
    CASE Role
        WHEN 'Admin' THEN 1
        WHEN 'Manager' THEN 2
        WHEN 'Staff' THEN 3
        ELSE 4
    END;

GO

-- ========================================
-- 4. Optional: Tạo thêm test users
-- ========================================

-- Uncomment để tạo thêm test users

/*
-- Admin user 2
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin2')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FullName, Role, IsActive, CreatedAt)
    VALUES (
        'admin2',
        'admin2@restaurantpos.com',
        '$2a$11$8YqXZ5J5YqXZ5J5YqXZ5J.YqXZ5J5YqXZ5J5YqXZ5J5YqXZ5J5Yq',
        N'Admin 2',
        'Admin',
        1,
        GETUTCDATE()
    );
    PRINT 'Admin2 user created.';
END

-- Manager user 2
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'manager2')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FullName, Role, IsActive, CreatedAt)
    VALUES (
        'manager2',
        'manager2@restaurantpos.com',
        '$2a$11$8YqXZ5J5YqXZ5J5YqXZ5J.YqXZ5J5YqXZ5J5YqXZ5J5YqXZ5J5Yq',
        N'Quản lý 2',
        'Manager',
        1,
        GETUTCDATE()
    );
    PRINT 'Manager2 user created.';
END

-- Staff user 2
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'staff2')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, FullName, Role, IsActive, CreatedAt)
    VALUES (
        'staff2',
        'staff2@restaurantpos.com',
        '$2a$11$8YqXZ5J5YqXZ5J5YqXZ5J.YqXZ5J5YqXZ5J5YqXZ5J5YqXZ5J5Yq',
        N'Nhân viên 2',
        'Staff',
        1,
        GETUTCDATE()
    );
    PRINT 'Staff2 user created.';
END
*/

GO

-- ========================================
-- 5. Validation
-- ========================================

PRINT '';
PRINT '========================================';
PRINT 'Validation - All Roles Present';
PRINT '========================================';

-- Kiểm tra xem đã có đủ 3 roles chưa
DECLARE @AdminCount INT, @ManagerCount INT, @StaffCount INT;

SELECT @AdminCount = COUNT(*) FROM Users WHERE Role = 'Admin';
SELECT @ManagerCount = COUNT(*) FROM Users WHERE Role = 'Manager';
SELECT @StaffCount = COUNT(*) FROM Users WHERE Role = 'Staff';

PRINT 'Admin users: ' + CAST(@AdminCount AS VARCHAR(10));
PRINT 'Manager users: ' + CAST(@ManagerCount AS VARCHAR(10));
PRINT 'Staff users: ' + CAST(@StaffCount AS VARCHAR(10));

IF @AdminCount > 0 AND @ManagerCount > 0 AND @StaffCount > 0
BEGIN
    PRINT '';
    PRINT '✅ SUCCESS: All three roles (Admin, Manager, Staff) are present in the database!';
END
ELSE
BEGIN
    PRINT '';
    PRINT '⚠️ WARNING: Not all roles are present. Please check the data.';
END

GO

PRINT '';
PRINT '========================================';
PRINT 'Script completed successfully!';
PRINT '========================================';
PRINT '';
PRINT 'Default credentials:';
PRINT '  Admin:   admin / Admin@123';
PRINT '  Manager: manager / Manager@123';
PRINT '  Staff:   staff / Staff@123';
PRINT '';
PRINT 'Note: Password hashes shown in this script are placeholders.';
PRINT 'You need to generate actual BCrypt hashes or use the API to create users.';
PRINT '========================================';

GO
