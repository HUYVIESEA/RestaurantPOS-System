# 🔌 API Documentation - Restaurant POS System

**Version:** 2.0.0  
**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Bearer Token

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Categories](#categories)
5. [Tables](#tables)
6. [Orders](#orders)
7. [Error Codes](#error-codes)
8. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "username": "nguyenvana",
  "password": "Password@123",
  "role": "Staff",
  "phoneNumber": "0123456789"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "userId": 1
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `409 Conflict` - Email or username already exists

---

### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@bundaumet.com",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "fullName": "Administrator",
    "email": "admin@bundaumet.com",
    "username": "admin",
    "role": "Admin",
    "phoneNumber": "0123456789",
    "isActive": true,
    "emailVerified": true
  }
}
```

**Errors:**
- `400 Bad Request` - Invalid credentials
- `401 Unauthorized` - Email not verified
- `403 Forbidden` - Account inactive

---

### Verify Email

**GET** `/auth/verify-email?token={verificationToken}`

Verify user's email address.

**Query Parameters:**
- `token` (string, required) - Email verification token

**Response (200 OK):**
```json
{
  "message": "Email verified successfully. You can now login."
}
```

**Errors:**
- `400 Bad Request` - Invalid or expired token

---

### Forgot Password

**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent. Please check your inbox."
}
```

**Errors:**
- `404 Not Found` - Email not found

---

### Reset Password

**POST** `/auth/reset-password`

Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword@123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Errors:**
- `400 Bad Request` - Invalid or expired token
- `400 Bad Request` - Weak password

---

## 👥 Users

### Get All Users

**GET** `/users`

Get list of all users (Admin only).

**Headers:**
```http
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (int, optional) - Page number (default: 1)
- `pageSize` (int, optional) - Items per page (default: 10)
- `search` (string, optional) - Search by name/email
- `role` (string, optional) - Filter by role

**Response (200 OK):**
```json
{
  "data": [
    {
      "userId": 1,
      "fullName": "Administrator",
      "email": "admin@bundaumet.com",
      "username": "admin",
      "role": "Admin",
      "phoneNumber": "0123456789",
      "isActive": true,
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalCount": 10,
  "page": 1,
  "pageSize": 10
}
```

---

### Get User by ID

**GET** `/users/{id}`

Get user details by ID.

**Response (200 OK):**
```json
{
  "userId": 1,
  "fullName": "Administrator",
  "email": "admin@bundaumet.com",
  "username": "admin",
  "role": "Admin",
  "phoneNumber": "0123456789",
  "isActive": true,
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `404 Not Found` - User not found

---

### Create User

**POST** `/users`

Create new user (Admin only).

**Request Body:**
```json
{
  "fullName": "New User",
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "Password@123",
  "role": "Staff",
  "phoneNumber": "0987654321"
}
```

**Response (201 Created):**
```json
{
  "userId": 2,
  "fullName": "New User",
  "email": "newuser@example.com",
  "username": "newuser",
  "role": "Staff",
  "phoneNumber": "0987654321",
  "isActive": true,
  "emailVerified": false
}
```

---

### Update User

**PUT** `/users/{id}`

Update user information.

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "phoneNumber": "0999999999",
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "userId": 2,
  "fullName": "Updated Name",
  "email": "newuser@example.com",
  "phoneNumber": "0999999999",
  "isActive": true
}
```

---

### Delete User

**DELETE** `/users/{id}`

Soft delete user (Admin only).

**Response (204 No Content)**

---

### Change Password

**POST** `/users/change-password`

Change current user's password.

**Request Body:**
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Errors:**
- `400 Bad Request` - Current password incorrect

---

## 📦 Products

### Get All Products

**GET** `/products`

Get list of all products.

**Query Parameters:**
- `categoryId` (int, optional) - Filter by category
- `search` (string, optional) - Search by name
- `minPrice` (decimal, optional) - Minimum price
- `maxPrice` (decimal, optional) - Maximum price
- `available` (bool, optional) - Filter by availability

**Response (200 OK):**
```json
{
  "data": [
    {
      "productId": 1,
      "name": "Bún Đậu Mắm Tôm",
      "description": "Món ăn truyền thống Hà Nội",
      "price": 45000,
      "categoryId": 1,
      "categoryName": "Món Chính",
      "imageUrl": "/images/bun-dau.jpg",
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "totalCount": 50
}
```

---

### Get Product by ID

**GET** `/products/{id}`

Get product details.

**Response (200 OK):**
```json
{
  "productId": 1,
  "name": "Bún Đậu Mắm Tôm",
  "description": "Món ăn truyền thống Hà Nội",
  "price": 45000,
  "categoryId": 1,
  "categoryName": "Món Chính",
  "imageUrl": "/images/bun-dau.jpg",
  "isAvailable": true,
  "nutritionInfo": "Calories: 450kcal",
  "allergens": ["Đậu phụ", "Mắm tôm"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Create Product

**POST** `/products`

Create new product.

**Request Body:**
```json
{
  "name": "Chả Cốm",
  "description": "Đặc sản Hà Nội",
  "price": 35000,
  "categoryId": 1,
  "imageUrl": "/images/cha-com.jpg",
  "isAvailable": true
}
```

**Response (201 Created):**
```json
{
  "productId": 2,
  "name": "Chả Cốm",
  "price": 35000,
  "categoryId": 1
}
```

---

### Update Product

**PUT** `/products/{id}`

Update product information.

**Request Body:**
```json
{
  "name": "Bún Đậu Mắm Tôm Đặc Biệt",
  "price": 55000,
  "isAvailable": true
}
```

**Response (200 OK):**
```json
{
  "productId": 1,
  "name": "Bún Đậu Mắm Tôm Đặc Biệt",
  "price": 55000
}
```

---

### Delete Product

**DELETE** `/products/{id}`

Delete product.

**Response (204 No Content)**

---

## 📂 Categories

### Get All Categories

**GET** `/categories`

Get list of all categories.

**Response (200 OK):**
```json
{
  "data": [
    {
      "categoryId": 1,
      "name": "Món Chính",
      "description": "Các món ăn chính",
      "displayOrder": 1,
      "productCount": 15,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Category by ID

**GET** `/categories/{id}`

Get category details with products.

**Response (200 OK):**
```json
{
  "categoryId": 1,
  "name": "Món Chính",
  "description": "Các món ăn chính",
  "displayOrder": 1,
  "products": [
    {
      "productId": 1,
      "name": "Bún Đậu Mắm Tôm",
      "price": 45000
    }
  ]
}
```

---

### Create Category

**POST** `/categories`

Create new category.

**Request Body:**
```json
{
  "name": "Đồ Uống",
  "description": "Các loại nước uống",
  "displayOrder": 2
}
```

**Response (201 Created):**
```json
{
  "categoryId": 2,
  "name": "Đồ Uống",
  "displayOrder": 2
}
```

---

### Update Category

**PUT** `/categories/{id}`

Update category.

**Request Body:**
```json
{
  "name": "Nước Giải Khát",
  "displayOrder": 3
}
```

**Response (200 OK)**

---

### Delete Category

**DELETE** `/categories/{id}`

Delete category (only if no products).

**Response (204 No Content)**

**Errors:**
- `400 Bad Request` - Category has products

---

## 🍽️ Tables

### Get All Tables

**GET** `/tables`

Get list of all tables.

**Query Parameters:**
- `isAvailable` (bool, optional) - Filter by availability
- `floor` (int, optional) - Filter by floor

**Response (200 OK):**
```json
{
  "data": [
    {
      "tableId": 1,
      "tableNumber": "T01",
      "capacity": 4,
      "floor": 1,
      "isAvailable": true,
      "currentOrderId": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Table by ID

**GET** `/tables/{id}`

Get table details.

**Response (200 OK):**
```json
{
  "tableId": 1,
  "tableNumber": "T01",
  "capacity": 4,
  "floor": 1,
  "isAvailable": true,
  "currentOrderId": null,
  "currentOrder": null
}
```

---

### Create Table

**POST** `/tables`

Create new table.

**Request Body:**
```json
{
  "tableNumber": "T10",
  "capacity": 6,
  "floor": 2
}
```

**Response (201 Created):**
```json
{
  "tableId": 10,
  "tableNumber": "T10",
  "capacity": 6,
  "floor": 2,
  "isAvailable": true
}
```

---

### Update Table

**PUT** `/tables/{id}`

Update table information.

**Request Body:**
```json
{
  "capacity": 8,
  "isAvailable": false
}
```

**Response (200 OK)**

---

### Delete Table

**DELETE** `/tables/{id}`

Delete table.

**Response (204 No Content)**

**Errors:**
- `400 Bad Request` - Table has active orders

---

## 📝 Orders

### Get All Orders

**GET** `/orders`

Get list of all orders.

**Query Parameters:**
- `status` (string, optional) - Filter by status (Pending, Completed, Cancelled)
- `tableId` (int, optional) - Filter by table
- `startDate` (datetime, optional) - Filter from date
- `endDate` (datetime, optional) - Filter to date

**Response (200 OK):**
```json
{
  "data": [
    {
      "orderId": 1,
      "tableId": 1,
      "tableNumber": "T01",
      "orderDate": "2024-01-15T10:30:00Z",
      "status": "Pending",
      "totalAmount": 150000,
      "items": [
        {
          "productId": 1,
          "productName": "Bún Đậu Mắm Tôm",
          "quantity": 2,
          "unitPrice": 45000,
          "subtotal": 90000
        }
      ],
      "createdBy": "admin",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 100
}
```

---

### Get Order by ID

**GET** `/orders/{id}`

Get order details.

**Response (200 OK):**
```json
{
  "orderId": 1,
  "tableId": 1,
  "tableNumber": "T01",
  "orderDate": "2024-01-15T10:30:00Z",
  "status": "Pending",
  "totalAmount": 150000,
  "items": [
    {
      "orderItemId": 1,
      "productId": 1,
      "productName": "Bún Đậu Mắm Tôm",
      "quantity": 2,
      "unitPrice": 45000,
      "subtotal": 90000,
      "notes": "Không hành"
    }
  ],
  "notes": "Giao nhanh",
  "createdBy": "admin",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

### Create Order

**POST** `/orders`

Create new order.

**Request Body:**
```json
{
  "tableId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "notes": "Không hành"
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "notes": "Giao nhanh"
}
```

**Response (201 Created):**
```json
{
  "orderId": 1,
  "tableId": 1,
  "totalAmount": 125000,
  "status": "Pending"
}
```

---

### Update Order

**PUT** `/orders/{id}`

Update order information.

**Request Body:**
```json
{
  "status": "Completed",
  "items": [
    {
      "productId": 1,
      "quantity": 3
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "orderId": 1,
  "status": "Completed",
  "totalAmount": 135000
}
```

---

### Cancel Order

**POST** `/orders/{id}/cancel`

Cancel an order.

**Request Body:**
```json
{
  "reason": "Customer request"
}
```

**Response (200 OK):**
```json
{
  "orderId": 1,
  "status": "Cancelled",
  "cancelledAt": "2024-01-15T10:40:00Z",
  "cancelReason": "Customer request"
}
```

---

### Complete Order

**POST** `/orders/{id}/complete`

Mark order as completed.

**Response (200 OK):**
```json
{
  "orderId": 1,
  "status": "Completed",
  "completedAt": "2024-01-15T11:00:00Z"
}
```

---

## ❌ Error Codes

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (duplicate) |
| 422 | `UNPROCESSABLE_ENTITY` | Business logic error |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

### Validation Error Example

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Email is required", "Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

---

## 🚦 Rate Limiting

API requests are rate-limited to prevent abuse.

**Limits:**
- **Anonymous:** 100 requests per hour
- **Authenticated:** 1000 requests per hour
- **Admin:** 5000 requests per hour

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2024-01-15T12:00:00Z
```

**Rate Limit Exceeded Response (429):**
```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 3600
  }
}
```

---

## 📊 Pagination

List endpoints support pagination with the following parameters:

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `pageSize` (int, default: 10, max: 100) - Items per page

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 10,
    "totalCount": 100,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## 🔍 Filtering & Sorting

### Filtering

Use query parameters to filter results:

```http
GET /products?categoryId=1&minPrice=10000&maxPrice=50000&available=true
```

### Sorting

Use `sortBy` and `sortOrder` parameters:

```http
GET /products?sortBy=price&sortOrder=asc
GET /orders?sortBy=orderDate&sortOrder=desc
```

**Valid Sort Orders:**
- `asc` - Ascending
- `desc` - Descending

---

## 📅 Date Formats

All dates are in ISO 8601 format (UTC):

```
2024-01-15T10:30:00Z
```

**Query Parameters:**
```http
GET /orders?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
```

---

## 🔐 Security Best Practices

### Token Storage
- Store JWT token securely (localStorage or httpOnly cookie)
- Include token in Authorization header
- Token expires after 1 hour (configurable)

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### CORS Policy
```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📝 Swagger UI

Interactive API documentation available at:

```
http://localhost:5000/swagger
```

Features:
- ✅ Try API endpoints
- ✅ View request/response schemas
- ✅ Authentication testing
- ✅ Download OpenAPI spec

---

## 🧪 Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bundaumet.com","password":"Admin@123"}'

# Get products (with token)
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import collection from `/docs/postman_collection.json`
2. Set environment variable `base_url` = `http://localhost:5000/api`
3. Login to get token
4. Token automatically applied to requests

---

## 📞 Support

### API Issues
- **GitHub Issues:** https://github.com/HUYVESEA0/RestaurantPOS-System/issues
- **Email:** api-support@bundaumet.com

### Documentation Updates
- **Last Updated:** January 15, 2024
- **Version:** 2.0.0

---

**⭐ For more details, see the Swagger UI at `/swagger` ⭐**
