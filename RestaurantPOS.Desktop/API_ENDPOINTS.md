# API Endpoints Documentation - Desktop Client

## 🔐 Authentication Endpoints

### Base URL
```
http://localhost:5000/api/Auth
```

### 1. Login
**Endpoint:** `POST /api/Auth/Login`

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "id": 1,
  "token": "eyJhbGci...",
  "username": "admin",
  "email": "admin@restaurantpos.com",
  "fullName": "Administrator",
  "role": "Admin",
  "expiresAt": "2025-11-28T07:53:00Z"
}
```

**Status:** ✅ Implemented in Desktop

---

### 2. Register
**Endpoint:** `POST /api/Auth/Register`

**Request:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "Password@123",
  "fullName": "New User",
  "phoneNumber": "0123456789",
  "role": "Staff"
}
```

**Status:** ⏳ Not yet implemented in Desktop

---

### 3. Change Password
**Endpoint:** `POST /api/Auth/ChangePassword`

**Request:**
```json
{
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

**Status:** ⏳ Not yet implemented in Desktop

---

## 📦 Orders Endpoints

### Base URL
```
http://localhost:5000/api/Orders
```

### 1. Get All Orders
**Endpoint:** `GET /api/Orders`

**Query Parameters:**
- `status` (optional): Filter by status
- `tableId` (optional): Filter by table

**Response:**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-001",
    "tableId": 5,
    "tableName": "Table 5",
    "status": "Pending",
    "totalAmount": 250000,
    "items": [...],
    "createdAt": "2025-11-27T07:00:00Z"
  }
]
```

**Status:** ⏳ Not yet implemented in Desktop

---

### 2. Create Order
**Endpoint:** `POST /api/Orders`

**Request:**
```json
{
  "tableId": 5,
  "items": [
    {
      "productId": 10,
      "quantity": 2,
      "notes": "No onions"
    }
  ]
}
```

**Status:** ⏳ Not yet implemented in Desktop

---

## 🪑 Tables Endpoints

### Base URL
```
http://localhost:5000/api/Tables
```

### 1. Get All Tables
**Endpoint:** `GET /api/Tables`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Table 1",
    "capacity": 4,
    "status": "Available",
    "currentOrderId": null,
    "occupiedAt": null
  }
]
```

**Status:** ⏳ Not yet implemented in Desktop

---

### 2. Update Table Status
**Endpoint:** `PUT /api/Tables/{id}/status`

**Request:**
```json
{
  "status": "Occupied"
}
```

**Status:** ⏳ Not yet implemented in Desktop

---

## 🍔 Products Endpoints

### Base URL
```
http://localhost:5000/api/Products
```

### 1. Get All Products
**Endpoint:** `GET /api/Products`

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `isAvailable` (optional): Filter by availability

**Response:**
```json
[
  {
    "id": 1,
    "name": "Phở Bò",
    "description": "Traditional Vietnamese beef noodle soup",
    "price": 50000,
    "categoryId": 1,
    "categoryName": "Main Dishes",
    "imageUrl": "/images/pho-bo.jpg",
    "isAvailable": true
  }
]
```

**Status:** ⏳ Not yet implemented in Desktop

---

## 📊 Categories Endpoints

### Base URL
```
http://localhost:5000/api/Categories
```

### 1. Get All Categories
**Endpoint:** `GET /api/Categories`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Main Dishes",
    "description": "Main course items",
    "displayOrder": 1
  }
]
```

**Status:** ⏳ Not yet implemented in Desktop

---

## 👥 Users Endpoints

### Base URL
```
http://localhost:5000/api/Users
```

### 1. Get All Users
**Endpoint:** `GET /api/Users`

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@restaurantpos.com",
    "fullName": "Administrator",
    "role": "Admin",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

**Status:** ⏳ Not yet implemented in Desktop

---

## 🔒 Authorization

Hầu hết endpoints yêu cầu JWT token trong header:

```
Authorization: Bearer {token}
```

Token được trả về từ endpoint Login và có thời hạn (thường là 24 giờ).

---

## 📋 Implementation Checklist

### Phase 1: Core Features (Completed)
- [x] Authentication Service
- [x] Login Screen
- [x] Dashboard Screen
- [x] Navigation System

### Phase 2: Order Management (Next)
- [ ] Order Service Interface
- [ ] Order List View
- [ ] Create Order View
- [ ] Order Details View

### Phase 3: Table Management
- [ ] Table Service Interface
- [ ] Table Grid View
- [ ] Table Status Update
- [ ] Table Assignment

### Phase 4: Product Management
- [ ] Product Service Interface
- [ ] Product List View
- [ ] Product Search
- [ ] Category Filter

### Phase 5: User Management
- [ ] User Service Interface
- [ ] User List View
- [ ] Create/Edit User
- [ ] Change Password

---

## 🛠️ Next Steps for Desktop Client

1. **Create Service Interfaces**
   - `IOrderService`
   - `ITableService`
   - `IProductService`
   - `ICategoryService`
   - `IUserService`

2. **Create Models**
   - Copy DTOs from API project
   - Or create shared class library

3. **Implement Services**
   - Use same pattern as `AuthenticationService`
   - Add JWT token to requests

4. **Create ViewModels**
   - OrderListViewModel
   - TableManagementViewModel
   - ProductListViewModel

5. **Create Views**
   - OrderListView
   - TableManagementView
   - ProductListView

---

## 📝 Notes

- All endpoints return JSON
- Date format: ISO 8601 (UTC)
- Currency: VND (Vietnamese Dong)
- Pagination: Not yet implemented (future enhancement)
- Error responses follow standard format:
  ```json
  {
    "message": "Error description",
    "errors": {...}
  }
  ```
