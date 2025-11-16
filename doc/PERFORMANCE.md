# ⚡ Performance Optimization Guide

**Version:** 2.0.0  
**Last Updated:** January 15, 2024

Complete guide for optimizing Restaurant POS System performance.

---

## 📋 Table of Contents

1. [Performance Overview](#performance-overview)
2. [Frontend Optimization](#frontend-optimization)
3. [Backend Optimization](#backend-optimization)
4. [Database Optimization](#database-optimization)
5. [Network Optimization](#network-optimization)
6. [Caching Strategies](#caching-strategies)
7. [Monitoring & Profiling](#monitoring--profiling)
8. [Performance Benchmarks](#performance-benchmarks)
9. [Best Practices](#best-practices)

---

## 🎯 Performance Overview

### Current Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Frontend** | | | |
| First Contentful Paint | <1.5s | ~1.2s | ✅ |
| Time to Interactive | <3s | ~2.5s | ✅ |
| Lighthouse Score | >90 | 95 | ✅ |
| Bundle Size | <500KB | ~450KB | ✅ |
| **Backend** | | | |
| API Response Time | <100ms | ~80ms | ✅ |
| Database Query Time | <50ms | ~30ms | ✅ |
| Concurrent Users | 100+ | 150+ | ✅ |

### Performance Goals

**Short Term:**
- Maintain current performance
- Optimize critical paths
- Reduce bundle size to <400KB

**Long Term:**
- Implement caching (Redis)
- Add CDN for static assets
- Implement lazy loading for all routes
- Database query optimization

---

## 💻 Frontend Optimization

### 1. Code Splitting

**Route-based Code Splitting:**
```typescript
// App.tsx
import React, { Suspense, lazy } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const ProductList = lazy(() => import('./components/Products/ProductList'));
const OrderList = lazy(() => import('./components/Orders/OrderList'));
const UserList = lazy(() => import('./components/Users/UserList'));
const Analytics = lazy(() => import('./components/Analytics/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

**Component-level Code Splitting:**
```typescript
// Heavy component loaded only when needed
const ChartComponent = lazy(() => import('./ChartComponent'));

const Analytics: React.FC = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <ChartComponent />
        </Suspense>
      )}
    </div>
  );
};
```

### 2. Bundle Optimization

**Vite Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Separate chunk for axios
          'http-client': ['axios'],
          
          // Heavy components
          'analytics': ['./src/components/Analytics/Analytics.tsx'],
        },
      },
    },
    // Minify with terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Set chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
});
```

### 3. React Performance Optimization

**useMemo for Expensive Calculations:**
```typescript
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  
  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]);
  
  return (
    <div>
      <input 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
      />
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

**useCallback for Event Handlers:**
```typescript
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { showToast } = useToast();
  
  // Memoize callback to prevent re-renders
  const handleDelete = useCallback(async () => {
    try {
      await productService.delete(product.id);
      showToast('Product deleted', 'success');
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  }, [product.id, showToast]);
  
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};
```

**React.memo for Component Memoization:**
```typescript
// Prevent re-renders when props don't change
const ProductCard = React.memo<{ product: Product }>(({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
    </div>
  );
});

// Custom comparison function
const ProductCard = React.memo<{ product: Product }>(
  ({ product }) => {
    return <div>{product.name}</div>;
  },
  (prevProps, nextProps) => {
    // Only re-render if product.id or product.name changed
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name
    );
  }
);
```

### 4. Image Optimization

**Lazy Loading Images:**
```typescript
const ProductImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      loading="lazy" 
      decoding="async"
    />
  );
};
```

**Responsive Images:**
```html
<picture>
  <source 
    media="(min-width: 1200px)" 
    srcset="product-large.jpg"
  />
  <source 
    media="(min-width: 768px)" 
    srcset="product-medium.jpg"
  />
  <img 
    src="product-small.jpg" 
    alt="Product" 
    loading="lazy"
  />
</picture>
```

### 5. Virtual Scrolling

**For Large Lists:**
```bash
npm install react-window
```

```typescript
import { FixedSizeList as List } from 'react-window';

const ProductListVirtualized: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={products.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

---

## 🖥️ Backend Optimization

### 1. Async/Await Everywhere

**Non-blocking I/O:**
```csharp
// ✅ Good - Async all the way
public async Task<IActionResult> GetProducts()
{
    var products = await _productService.GetAllAsync();
    return Ok(products);
}

public async Task<IEnumerable<Product>> GetAllAsync()
{
    return await _context.Products
        .Include(p => p.Category)
        .ToListAsync();
}

// ❌ Bad - Blocking
public IActionResult GetProducts()
{
    var products = _productService.GetAll(); // Blocks thread
    return Ok(products);
}
```

### 2. Optimize EF Core Queries

**Select Only Needed Columns:**
```csharp
// ✅ Good - Project to DTO
var products = await _context.Products
    .Select(p => new ProductDto
    {
        ProductId = p.ProductId,
        Name = p.Name,
        Price = p.Price,
        CategoryName = p.Category.Name
    })
    .ToListAsync();

// ❌ Bad - Fetch entire entity
var products = await _context.Products
    .Include(p => p.Category)
    .ToListAsync();
```

**Use AsNoTracking for Read-Only:**
```csharp
// ✅ Good - No tracking for read-only
var products = await _context.Products
    .AsNoTracking()
    .ToListAsync();

// For updates, tracking is needed
var product = await _context.Products
    .FirstOrDefaultAsync(p => p.ProductId == id);
product.Name = "Updated";
await _context.SaveChangesAsync();
```

**Avoid N+1 Queries:**
```csharp
// ❌ Bad - N+1 query problem
var orders = await _context.Orders.ToListAsync();
foreach (var order in orders)
{
    // This executes a query for each order!
    var items = await _context.OrderItems
        .Where(oi => oi.OrderId == order.OrderId)
        .ToListAsync();
}

// ✅ Good - Single query with Include
var orders = await _context.Orders
    .Include(o => o.OrderItems)
        .ThenInclude(oi => oi.Product)
    .ToListAsync();
```

### 3. Pagination

**Always Paginate Large Datasets:**
```csharp
public async Task<PagedResult<ProductDto>> GetProductsAsync(
    int page = 1, 
    int pageSize = 10)
{
    var query = _context.Products.AsQueryable();
    
    var totalCount = await query.CountAsync();
    
    var products = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new ProductDto { ... })
        .ToListAsync();
    
    return new PagedResult<ProductDto>
    {
        Data = products,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
```

### 4. Response Compression

**Enable Compression:**
```csharp
// Program.cs
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});

app.UseResponseCompression();
```

---

## 🗄️ Database Optimization

### 1. Indexing Strategy

**Create Indexes:**
```sql
-- Foreign keys
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Orders_TableId ON Orders(TableId);
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON OrderItems(ProductId);

-- Frequently queried columns
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_Orders_OrderDate ON Orders(OrderDate);
CREATE INDEX IX_Products_Name ON Products(Name);
CREATE INDEX IX_Products_IsAvailable ON Products(IsAvailable);

-- Composite indexes for common queries
CREATE INDEX IX_Orders_Status_OrderDate 
ON Orders(Status, OrderDate);

CREATE INDEX IX_Products_CategoryId_IsAvailable 
ON Products(CategoryId, IsAvailable);
```

**EF Core Index Configuration:**
```csharp
// ApplicationDbContext.cs
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Product>()
        .HasIndex(p => p.CategoryId)
        .HasDatabaseName("IX_Products_CategoryId");
    
    modelBuilder.Entity<Product>()
        .HasIndex(p => new { p.CategoryId, p.IsAvailable })
        .HasDatabaseName("IX_Products_CategoryId_IsAvailable");
    
    modelBuilder.Entity<Order>()
        .HasIndex(o => o.Status)
        .HasDatabaseName("IX_Orders_Status");
}
```

### 2. Query Optimization

**Analyze Query Plans:**
```sql
-- Enable execution plan
SET SHOWPLAN_ALL ON;

-- Run your query
SELECT p.*, c.Name AS CategoryName
FROM Products p
INNER JOIN Categories c ON p.CategoryId = c.CategoryId
WHERE p.IsAvailable = 1;

-- Check for table scans, missing indexes, etc.
```

**Use Covering Indexes:**
```sql
-- Covering index includes all columns in SELECT
CREATE INDEX IX_Products_Covering 
ON Products(CategoryId, IsAvailable)
INCLUDE (Name, Price, ImageUrl);

-- Now this query uses only the index (no table lookup)
SELECT Name, Price, ImageUrl
FROM Products
WHERE CategoryId = 1 AND IsAvailable = 1;
```

### 3. Connection Pooling

**Configure Connection Pool:**
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=RestaurantPOS;Min Pool Size=10;Max Pool Size=100;Pooling=true;"
  }
}
```

### 4. Database Maintenance

**Regular Maintenance:**
```sql
-- Update statistics weekly
UPDATE STATISTICS Products;
UPDATE STATISTICS Orders;
UPDATE STATISTICS OrderItems;

-- Rebuild indexes monthly
ALTER INDEX ALL ON Products REBUILD;
ALTER INDEX ALL ON Orders REBUILD;

-- Check fragmentation
SELECT 
    OBJECT_NAME(ps.object_id) AS TableName,
    i.name AS IndexName,
    ps.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ps
INNER JOIN sys.indexes i ON ps.object_id = i.object_id 
    AND ps.index_id = i.index_id
WHERE ps.avg_fragmentation_in_percent > 30;
```

---

## 🌐 Network Optimization

### 1. HTTP/2

**Enable HTTP/2:**
```csharp
// Program.cs
builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureHttpsDefaults(https =>
    {
        https.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13;
    });
});
```

### 2. Request Optimization

**Debounce Search Requests:**
```typescript
import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

const SearchProducts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  
  // Debounce search - wait 300ms after user stops typing
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length >= 3) {
        const products = await productService.search(term);
        setResults(products);
      }
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search products..."
    />
  );
};
```

### 3. Batch Requests

**Batch Multiple API Calls:**
```typescript
// Instead of multiple requests
const product1 = await productService.getById(1);
const product2 = await productService.getById(2);
const product3 = await productService.getById(3);

// Use Promise.all
const [product1, product2, product3] = await Promise.all([
  productService.getById(1),
  productService.getById(2),
  productService.getById(3),
]);
```

---

## 💾 Caching Strategies

### 1. Browser Caching

**Configure Cache Headers:**
```csharp
app.Use(async (context, next) =>
{
    // Cache static assets for 1 year
    if (context.Request.Path.StartsWithSegments("/assets"))
    {
        context.Response.Headers.CacheControl = "public,max-age=31536000";
    }
    
    // Cache API responses for 5 minutes
    if (context.Request.Path.StartsWithSegments("/api/categories"))
    {
        context.Response.Headers.CacheControl = "public,max-age=300";
    }
    
    await next();
});
```

### 2. Application-Level Caching

**Memory Cache:**
```csharp
// Program.cs
builder.Services.AddMemoryCache();

// Service
public class ProductService
{
    private readonly IMemoryCache _cache;
    
    public async Task<IEnumerable<Category>> GetCategoriesAsync()
    {
        const string cacheKey = "categories";
        
        if (!_cache.TryGetValue(cacheKey, out IEnumerable<Category> categories))
        {
            categories = await _context.Categories.ToListAsync();
            
            _cache.Set(cacheKey, categories, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
            });
        }
        
        return categories;
    }
}
```

### 3. Redis Cache (Future)

```csharp
// Install: StackExchange.Redis
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:ConnectionString"];
    options.InstanceName = "RestaurantPOS:";
});

// Usage
public class ProductService
{
    private readonly IDistributedCache _cache;
    
    public async Task<Product> GetProductAsync(int id)
    {
        var cacheKey = $"product:{id}";
        var cachedProduct = await _cache.GetStringAsync(cacheKey);
        
        if (cachedProduct != null)
        {
            return JsonSerializer.Deserialize<Product>(cachedProduct);
        }
        
        var product = await _context.Products.FindAsync(id);
        
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(product),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
            }
        );
        
        return product;
    }
}
```

---

## 📊 Monitoring & Profiling

### Frontend Profiling

**React DevTools Profiler:**
```typescript
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id: string,
    phase: "mount" | "update",
    actualDuration: number,
  ) => {
    console.log(`${id} took ${actualDuration}ms to ${phase}`);
  };
  
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}
```

**Lighthouse Audit:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5173 --view
```

### Backend Profiling

**Application Insights:**
```csharp
builder.Services.AddApplicationInsightsTelemetry();

// Track custom metrics
var telemetryClient = new TelemetryClient();
telemetryClient.TrackMetric("OrderProcessingTime", stopwatch.ElapsedMilliseconds);
```

**MiniProfiler (Development):**
```csharp
builder.Services.AddMiniProfiler(options =>
{
    options.RouteBasePath = "/profiler";
}).AddEntityFramework();

app.UseMiniProfiler();
```

---

## 📈 Performance Benchmarks

### Load Testing

**Using Apache Bench:**
```bash
# Test API endpoint
ab -n 1000 -c 100 http://localhost:5000/api/products

# Results to target:
# Requests per second: > 500
# Mean response time: < 100ms
# 95th percentile: < 200ms
```

**Using k6:**
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function() {
  let response = http.get('http://localhost:5000/api/products');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

---

## ✅ Best Practices Checklist

### Frontend
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Images optimized and lazy loaded
- [ ] useMemo/useCallback for expensive operations
- [ ] React.memo for component memoization
- [ ] Virtual scrolling for large lists
- [ ] Debounce search inputs
- [ ] Bundle size < 500KB

### Backend
- [ ] All I/O operations async
- [ ] EF Core queries optimized
- [ ] Pagination implemented
- [ ] Response compression enabled
- [ ] Connection pooling configured
- [ ] Memory cache for static data
- [ ] API response time < 100ms

### Database
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Query execution plans analyzed
- [ ] Statistics updated regularly
- [ ] Indexes defragmented monthly
- [ ] Connection pooling enabled

---

## 📞 Support

**Performance Issues?**
- 📧 Email: performance@bundaumet.com
- 📊 Profiling reports welcome

---

**Last Updated:** January 15, 2024  
**Version:** 2.0.0

**Fast apps make happy users!** ⚡
