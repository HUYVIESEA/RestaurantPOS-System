---
description: Kế hoạch cập nhật phân quyền người dùng cho ASP.NET API
---

# Kế hoạch cập nhật phân quyền người dùng

## Vấn đề hiện tại

Ứng dụng đã có hệ thống Role (Admin, Manager, Staff) nhưng **chưa được áp dụng đầy đủ** vào các Controllers:

1. ✅ **UsersController** - Đã có phân quyền Admin đầy đủ
2. ✅ **AuthController** - Đã có phân quyền Admin cho một số endpoint
3. ❌ **ProductsController** - Chỉ có `[Authorize]` chung, chưa phân quyền theo Role
4. ❌ **CategoriesController** - Chỉ có `[Authorize]` chung, chưa phân quyền theo Role
5. ❌ **OrdersController** - Chỉ có `[Authorize]` chung, chưa phân quyền theo Role
6. ❌ **TablesController** - Chỉ có `[Authorize]` chung, chưa phân quyền theo Role
7. ❌ **ReportsController** - Chỉ có `[Authorize]` chung, chưa phân quyền theo Role

## Phân quyền đề xuất

### 1. **Admin** (Quản trị viên)
- Toàn quyền trên tất cả các chức năng
- Quản lý Users (tạo, sửa, xóa, phân quyền)
- Quản lý Products, Categories (tạo, sửa, xóa)
- Quản lý Tables (tạo, sửa, xóa)
- Xem tất cả Reports
- Quản lý Orders (xem, sửa, xóa)

### 2. **Manager** (Quản lý)
- Quản lý Products, Categories (tạo, sửa, xóa)
- Quản lý Tables (tạo, sửa, xóa)
- Xem Reports (nhưng không xóa)
- Quản lý Orders (xem, sửa, xóa)
- KHÔNG được quản lý Users

### 3. **Staff** (Nhân viên)
- Xem Products, Categories (chỉ đọc)
- Xem Tables (chỉ đọc)
- Tạo và quản lý Orders của mình
- KHÔNG được xóa Orders
- KHÔNG được xem Reports
- KHÔNG được quản lý Products/Categories/Tables

## Các bước thực hiện

### Bước 1: Cập nhật ProductsController
- GET (tất cả): `[Authorize]` - Tất cả user
- POST (tạo): `[Authorize(Roles = "Admin,Manager")]`
- PUT (sửa): `[Authorize(Roles = "Admin,Manager")]`
- DELETE (xóa): `[Authorize(Roles = "Admin,Manager")]`

### Bước 2: Cập nhật CategoriesController
- GET (tất cả): `[Authorize]` - Tất cả user
- POST (tạo): `[Authorize(Roles = "Admin,Manager")]`
- PUT (sửa): `[Authorize(Roles = "Admin,Manager")]`
- DELETE (xóa): `[Authorize(Roles = "Admin,Manager")]`

### Bước 3: Cập nhật OrdersController
- GET (tất cả): `[Authorize(Roles = "Admin,Manager")]` - Chỉ Admin/Manager xem tất cả
- GET (theo ID): `[Authorize]` - Tất cả user (nhưng cần kiểm tra quyền sở hữu)
- POST (tạo): `[Authorize]` - Tất cả user
- PATCH (cập nhật status): `[Authorize]` - Tất cả user
- DELETE (xóa): `[Authorize(Roles = "Admin,Manager")]` - Chỉ Admin/Manager

### Bước 4: Cập nhật TablesController
- GET (tất cả): `[Authorize]` - Tất cả user
- POST (tạo): `[Authorize(Roles = "Admin,Manager")]`
- PUT (sửa): `[Authorize(Roles = "Admin,Manager")]`
- DELETE (xóa): `[Authorize(Roles = "Admin,Manager")]`

### Bước 5: Cập nhật ReportsController
- Tất cả endpoints: `[Authorize(Roles = "Admin,Manager")]`

### Bước 6: Tạo Role Model (Optional - nâng cao)
Nếu muốn mở rộng trong tương lai, có thể tạo:
- `Role.cs` model
- `UserRole.cs` model (many-to-many relationship)
- Nhưng hiện tại dùng string Role trong User model là đủ

### Bước 7: Testing
- Test với user Admin
- Test với user Manager
- Test với user Staff
- Đảm bảo các endpoint trả về 403 Forbidden khi không có quyền

## Ghi chú

- Đã có JWT Authentication hoạt động tốt
- Role được lưu trong JWT token claims
- Chỉ cần thêm `[Authorize(Roles = "...")]` vào các endpoints
