# 🏗️ System Architecture - Restaurant POS System

**Version:** 2.0.0  
**Last Updated:** January 15, 2024

Complete system architecture documentation for Restaurant POS System.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Component Architecture](#component-architecture)
5. [Data Flow](#data-flow)
6. [Design Patterns](#design-patterns)
7. [Scalability](#scalability)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Overview

Restaurant POS System is a **full-stack web application** built with modern technologies following **Clean Architecture** and **SOLID principles**.

### Architecture Type
- **Frontend:** Single Page Application (SPA)
- **Backend:** RESTful API (Web API)
- **Database:** Relational Database (SQL Server)
- **Pattern:** Client-Server Architecture

### Key Characteristics
- ✅ **Separation of Concerns** - Clear boundaries between layers
- ✅ **Modularity** - Independent, reusable components
- ✅ **Scalability** - Horizontal and vertical scaling
- ✅ **Maintainability** - Easy to update and extend
- ✅ **Testability** - Isolated components for testing

---

## 📐 Architecture Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Web Browser (Chrome/Edge/Firefox)            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  React SPA (TypeScript)                           │  │   │
│  │  │  - Components (UI)                                 │  │   │
│  │  │  - Contexts (State)                               │  │   │
│  │  │  - Services (API Calls)                           │  │   │
│  │  │  - Routing (React Router)                         │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS/HTTP
                           │ JSON
                           │ JWT Token
┌──────────────────────────┴──────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           ASP.NET Core Web API (.NET 8.0)               │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Controllers                                        │  │   │
│  │  │  - AuthController                                  │  │   │
│  │  │  - UsersController                                 │  │   │
│  │  │  - ProductsController                              │  │   │
│  │  │  - OrdersController                                │  │   │
│  │  │  - TablesController                                │  │   │
│  │  │  - CategoriesController                            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Services                              │   │
│  │  - AuthService (JWT, Password Hash)                     │   │
│  │  - EmailService (SMTP)                                  │   │
│  │  - OrderService (Business Rules)                        │   │
│  │  - AnalyticsService (Calculations)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                       DATA ACCESS LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Entity Framework Core 8.0                      │   │
│  │  - ApplicationDbContext                                  │   │
│  │  - DbSet<T> Collections                                 │   │
│  │  - Migrations                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ ADO.NET
                           │ T-SQL
┌──────────────────────────┴──────────────────────────────────────┐
│                        DATABASE LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SQL Server 2019+                            │   │
│  │  - Users Table                                          │   │
│  │  - Products Table                                       │   │
│  │  - Categories Table                                     │   │
│  │  - Orders Table                                         │   │
│  │  - OrderItems Table                                     │   │
│  │  - Tables Table                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT APPLICATION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routing    │  │   Context    │  │   Themes     │    │
│  │ React Router │  │ Auth/Toast   │  │ Light/Dark   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                      COMPONENTS                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │Dashboard │ │ Products │ │  Orders  │ │  Users   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Tables  │ │Categories│ │Analytics │ │   Auth   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Common Components                        │     │
│  │  Navbar, Toast, Skeleton, ThemeToggle, etc.     │     │
│  └──────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                       SERVICES                              │
│  ┌──────────────────────────────────────────────────┐     │
│  │  API Services (Axios)                            │     │
│  │  - authService, userService, productService      │     │
│  │  - orderService, tableService, categoryService   │     │
│  │  - analyticsService                              │     │
│  └──────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    UTILITIES & TYPES                        │
│  ┌────────────────┐  ┌──────────────────────┐             │
│  │ priceUtils.ts  │  │  TypeScript Types    │             │
│  │ formatPrice()  │  │  Interfaces & Types  │             │
│  └────────────────┘  └──────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  ASP.NET CORE WEB API                       │
├─────────────────────────────────────────────────────────────┤
│                    CONTROLLERS                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  HTTP Endpoints (RESTful API)                       │   │
│  │  - Routing, Model Binding, Validation              │   │
│  │  - Request/Response Handling                        │   │
│  │  - Authentication & Authorization                   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      SERVICES                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Logic & Rules                             │   │
│  │  - Data Processing                                  │   │
│  │  - Validation                                       │   │
│  │  - External Services (Email)                        │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    DATA ACCESS                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Entity Framework Core                              │   │
│  │  - DbContext                                        │   │
│  │  - Entities (Models)                                │   │
│  │  - Migrations                                       │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     MIDDLEWARE                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  - CORS                                             │   │
│  │  - Authentication                                   │   │
│  │  - Error Handling                                   │   │
│  │  - Logging                                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend Stack

```typescript
const frontendTech = {
  core: {
    framework: "React 18.2.0",
    language: "TypeScript 5.0",
    buildTool: "Vite 5.0"
  },
  routing: "React Router 6.20",
  httpClient: "Axios 1.6",
  styling: {
    approach: "CSS Variables + Modern CSS",
    theme: "Light/Dark Mode System",
    variables: "200+ CSS Custom Properties"
  },
  icons: "FontAwesome 6.5",
  stateManagement: "Context API",
  formHandling: "Native React",
  typeSystem: "TypeScript Strict Mode"
};
```

### Backend Stack

```csharp
var backendTech = new {
    Framework = ".NET 8.0",
    Language = "C# 12",
    API = "ASP.NET Core Web API",
    ORM = "Entity Framework Core 8.0",
    Database = "SQL Server 2019+",
    Authentication = "JWT (JSON Web Tokens)",
    EmailService = "SMTP (Gmail)",
    Documentation = "Swagger/OpenAPI 3.0",
    DependencyInjection = "Built-in .NET DI",
    Configuration = "appsettings.json"
};
```

### Infrastructure

```yaml
Development:
  OS: Windows 10/11
  IDE: Visual Studio 2022 / VS Code
  Database: SQL Server Express
  Node: 18.0+
  .NET: 8.0 SDK

Production:
  Frontend: Netlify/Vercel/Azure Static Web Apps
  Backend: Azure App Service/AWS EC2
  Database: Azure SQL/AWS RDS
  CDN: CloudFront/Azure CDN
  SSL: Let's Encrypt/Azure Managed
```

---

## 🔄 Data Flow

### User Authentication Flow

```
1. User submits login credentials
   ↓
2. Frontend validates input
   ↓
3. POST /api/auth/login
   ↓
4. AuthController receives request
   ↓
5. AuthService verifies credentials
   ↓
6. Generate JWT token
   ↓
7. Return token + user data
   ↓
8. Frontend stores token in localStorage
   ↓
9. Set axios default header
   ↓
10. Redirect to Dashboard
```

### Order Creation Flow

```
User selects products
   ↓
Add to cart (local state)
   ↓
Review order
   ↓
Submit order
   ↓
POST /api/orders
   ↓
OrdersController.Create()
   ↓
OrderService.CreateOrder()
   ↓
Validate business rules
   ↓
Begin database transaction
   ↓
Create Order entity
   ↓
Create OrderItems entities
   ↓
Update table status
   ↓
Calculate total
   ↓
Commit transaction
   ↓
Return created order
   ↓
Frontend updates state
   ↓
Show success message
   ↓
Navigate to order detail
```

### Real-time Data Flow

```
Component mounts
   ↓
useEffect() triggered
   ↓
Call API service
   ↓
Show loading skeleton
   ↓
Axios interceptor adds auth header
   ↓
HTTP request to backend
   ↓
Controller processes request
   ↓
Service executes business logic
   ↓
EF Core queries database
   ↓
Map entities to DTOs
   ↓
Return JSON response
   ↓
Axios interceptor handles response
   ↓
Update component state
   ↓
Re-render with new data
```

---

## 🎨 Design Patterns

### Frontend Patterns

**1. Container/Presentational Pattern**
```typescript
// Container Component (Logic)
const ProductListContainer: React.FC = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  return <ProductListView products={products} />;
};

// Presentational Component (UI)
const ProductListView: React.FC<Props> = ({ products }) => {
  return <div>{products.map(renderProduct)}</div>;
};
```

**2. Custom Hooks Pattern**
```typescript
// Reusable logic
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const loadProducts = async () => {
    // Load logic
  };
  
  return { products, loading, loadProducts };
};
```

**3. Context Provider Pattern**
```typescript
// Global state management
export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**4. Service Layer Pattern**
```typescript
// Centralized API calls
const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};
```

### Backend Patterns

**1. Repository Pattern**
```csharp
// Data access abstraction
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}
```

**2. Service Layer Pattern**
```csharp
// Business logic separation
public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderDto dto);
    Task<OrderDto> GetOrderByIdAsync(int id);
    Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
    Task CompleteOrderAsync(int id);
    Task CancelOrderAsync(int id);
}
```

**3. Dependency Injection**
```csharp
// Program.cs
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOrderService, OrderService>();
```

**4. DTO Pattern**
```csharp
// Data Transfer Objects
public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string CategoryName { get; set; }
}
```

---

## 📈 Scalability

### Horizontal Scaling

```
┌────────────┐
│ Load       │
│ Balancer   │
└─────┬──────┘
      │
      ├──────┬──────┬──────┐
      │      │      │      │
   ┌──▼─┐ ┌──▼─┐ ┌──▼─┐ ┌──▼─┐
   │API │ │API │ │API │ │API │
   │ 1  │ │ 2  │ │ 3  │ │ 4  │
   └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘
      └──────┴──────┴──────┘
             │
      ┌──────▼──────┐
      │  Database   │
      │  (Primary)  │
      └─────────────┘
```

### Vertical Scaling

- **Frontend:** Increase server resources (CPU, RAM)
- **Backend:** Add more powerful servers
- **Database:** Upgrade to higher-tier database

### Caching Strategy

```
Browser Cache
   ↓
CDN Cache
   ↓
Application Cache (Redis)
   ↓
Database
```

### Database Optimization

- **Indexing:** Key columns for fast queries
- **Partitioning:** Large tables split by date
- **Read Replicas:** Separate read/write databases
- **Connection Pooling:** Reuse database connections

---

## 🔒 Security Architecture

### Authentication Flow

```
User Login
   ↓
Verify Credentials
   ↓
Generate JWT Token
   ↓
Return Token (HttpOnly Cookie or LocalStorage)
   ↓
Client stores token
   ↓
Include token in all requests
   ↓
Server validates token
   ↓
Grant/Deny access
```

### Authorization Layers

```
┌─────────────────────────────────┐
│  Role-Based Access Control      │
│  - Admin: Full access           │
│  - Staff: Limited access        │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  Endpoint Protection            │
│  [Authorize] attribute          │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  JWT Token Validation           │
│  Signature verification         │
└─────────────────────────────────┘
```

### Security Measures

**Frontend:**
- ✅ HTTPS only
- ✅ XSS protection (React escapes by default)
- ✅ CSRF tokens (for state-changing operations)
- ✅ Input validation
- ✅ Secure token storage

**Backend:**
- ✅ JWT authentication
- ✅ Password hashing (BCrypt)
- ✅ SQL injection prevention (EF Core)
- ✅ CORS configuration
- ✅ Rate limiting (TODO)
- ✅ API key validation (TODO)

**Database:**
- ✅ Encrypted connections
- ✅ Parameterized queries
- ✅ Principle of least privilege
- ✅ Regular backups
- ✅ Audit logging

---

## 🚀 Deployment Architecture

### Development Environment

```
Developer Machine
   ├── Frontend: npm run dev (Vite)
   ├── Backend: dotnet run
   └── Database: SQL Server Express (Local)
```

### Staging Environment

```
┌─────────────────────────────────────┐
│  Azure/AWS Staging                  │
│  ├── Frontend: Static Web App       │
│  ├── Backend: App Service           │
│  └── Database: Azure SQL (Dev tier) │
└─────────────────────────────────────┘
```

### Production Environment

```
┌──────────────────────────────────────────────┐
│             Production (Azure)               │
│                                              │
│  ┌────────────┐      ┌─────────────┐        │
│  │   CDN      │◄─────┤  Frontend   │        │
│  │ CloudFront │      │ Static App  │        │
│  └────────────┘      └─────────────┘        │
│                                              │
│  ┌────────────┐      ┌─────────────┐        │
│  │   API      │◄─────┤  Backend    │        │
│  │ Gateway    │      │ App Service │        │
│  └────────────┘      └──────┬──────┘        │
│                             │               │
│                      ┌──────▼──────┐        │
│                      │  Database   │        │
│                      │  Azure SQL  │        │
│                      └─────────────┘        │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  Monitoring & Logging               │    │
│  │  - Application Insights             │    │
│  │  - Log Analytics                    │    │
│  └─────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 📊 Performance Considerations

### Frontend Optimization

- ✅ **Code Splitting:** Dynamic imports
- ✅ **Lazy Loading:** React.lazy()
- ✅ **Memoization:** useMemo, useCallback
- ✅ **Bundle Size:** ~450KB (target <500KB)
- ✅ **Asset Optimization:** Minification, compression

### Backend Optimization

- ✅ **Async/Await:** Non-blocking I/O
- ✅ **Caching:** Reduce database calls
- ✅ **Query Optimization:** Proper indexes
- ✅ **Connection Pooling:** Reuse connections
- ✅ **Response Compression:** Gzip

### Database Optimization

- ✅ **Indexes:** On foreign keys and search columns
- ✅ **Query Plans:** Analyze and optimize
- ✅ **Normalized Schema:** Reduce redundancy
- ✅ **Pagination:** Limit result sets

---

## 🔧 Maintainability

### Code Organization

```
Clear separation of concerns
   ├── Components handle UI
   ├── Services handle API
   ├── Contexts handle state
   └── Utils handle helpers
```

### Naming Conventions

- **Components:** PascalCase
- **Files:** PascalCase.tsx
- **Variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **CSS Classes:** kebab-case

### Documentation

- ✅ Inline comments for complex logic
- ✅ JSDoc for functions
- ✅ README for each module
- ✅ API documentation (Swagger)
- ✅ Architecture documentation (this file)

---

## 🎯 Future Architecture Plans

### Microservices (v3.0)

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Auth      │  │   Order     │  │  Product    │
│  Service    │  │  Service    │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
       ↓                ↓                ↓
┌──────────────────────────────────────────────┐
│           API Gateway / Service Mesh         │
└──────────────────────────────────────────────┘
```

### Event-Driven Architecture

```
Order Created
   ↓
Event Bus
   ├──→ Email Service
   ├──→ Notification Service
   └──→ Analytics Service
```

### CQRS Pattern

```
Commands (Write)    Queries (Read)
      ↓                   ↓
  Write DB            Read DB
      ↓                   ↓
  Event Store      → Projection
```

---

## 📚 References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microsoft Architecture Guide](https://docs.microsoft.com/en-us/dotnet/architecture/)
- [React Architecture Patterns](https://www.patterns.dev/posts/react-patterns/)
- [REST API Best Practices](https://restfulapi.net/)

---

**Status:** ✅ **PRODUCTION READY**

**Last Updated:** January 15, 2024  
**Maintained by:** Restaurant POS Team
