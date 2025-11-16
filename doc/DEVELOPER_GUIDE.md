# 💻 Developer Guide - Restaurant POS System

**Version:** 2.0.0  
**Last Updated:** January 15, 2024

Complete guide for developers working on the Restaurant POS System.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Styling Guide](#styling-guide)
8. [Adding New Features](#adding-new-features)
9. [Testing](#testing)
10. [Debugging](#debugging)
11. [Best Practices](#best-practices)
12. [Common Patterns](#common-patterns)

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
.NET SDK >= 8.0
SQL Server >= 2019
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/HUYVESEA0/RestaurantPOS-System.git
cd RestaurantPOS-System

# Run automated setup
setup.bat

# Or manual setup
cd restaurant-pos-client
npm install
cd ../RestaurantPOS.API
dotnet restore
```

### Development Workflow

```bash
# Start backend (Terminal 1)
cd RestaurantPOS.API
dotnet run

# Start frontend (Terminal 2)
cd restaurant-pos-client
npm run dev
```

---

## 📁 Project Structure

### Frontend Structure

```
restaurant-pos-client/
├── public/                 # Static assets
│   ├── index.html
│   └── debug-navbar.js
│
├── src/
│   ├── components/        # React components
│   │   ├── Analytics/
│   │   ├── Auth/
│   │   ├── Categories/
│   │   ├── Common/       # Reusable components
│   │   ├── Dashboard/
│   │   ├── Orders/
│   │   ├── Products/
│   │   ├── Tables/
│   │   └── Users/
│   │
│   ├── contexts/         # Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── ToastContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   ├── services/         # API services
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── productService.ts
│   │   └── analyticsService.ts
│   │
│   ├── types/           # TypeScript types
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   └── notification.ts
│   │
│   ├── utils/           # Utility functions
│   │   └── priceUtils.ts
│   │
│   ├── styles/          # Global styles
│   │   └── theme.css
│   │
│   ├── App.tsx          # Main app component
│   ├── App.css          # App styles
│   ├── index.tsx        # Entry point
│   └── index.css        # Global styles
│
├── .env                 # Environment variables
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite config
```

### Backend Structure

```
RestaurantPOS.API/
├── Controllers/         # API endpoints
│   ├── AuthController.cs
│   ├── UsersController.cs
│   ├── ProductsController.cs
│   ├── OrdersController.cs
│   └── TablesController.cs
│
├── Models/             # Data models
│   ├── User.cs
│   ├── Product.cs
│   ├── Order.cs
│   └── DTOs/
│
├── Services/           # Business logic
│   ├── AuthService.cs
│   ├── EmailService.cs
│   └── OrderService.cs
│
├── Data/              # Database context
│   └── ApplicationDbContext.cs
│
├── Properties/
│   └── launchSettings.json
│
├── appsettings.json   # Configuration
└── Program.cs         # Entry point
```

---

## 📝 Coding Standards

### TypeScript/JavaScript

**Naming Conventions:**
```typescript
// Components: PascalCase
const ProductList: React.FC = () => {};

// Functions: camelCase
const handleSubmit = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000/api';

// Interfaces/Types: PascalCase with 'I' prefix for interfaces
interface IProduct {}
type ProductType = {};
```

**File Naming:**
```
Components: PascalCase.tsx
Services: camelCase.ts
Styles: PascalCase.css
Utils: camelCase.ts
Types: camelCase.ts
```

### C# Conventions

```csharp
// Classes: PascalCase
public class UserService {}

// Methods: PascalCase
public async Task<User> GetUserById(int id) {}

// Variables: camelCase
private string userName;

// Constants: PascalCase
public const string ApiVersion = "v1";

// Interfaces: PascalCase with 'I' prefix
public interface IUserService {}
```

### Code Formatting

**ESLint Configuration:**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ]
}
```

**Prettier Configuration:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 🏗️ Component Architecture

### Component Structure

```typescript
// ProductList.tsx
import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import productService from '../../services/productService';
import './ProductList.css';

interface ProductListProps {
  categoryId?: number;
}

const ProductList: React.FC<ProductListProps> = ({ categoryId }) => {
  // 1. State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Contexts
  const { showToast } = useToast();
  
  // 3. Effects
  useEffect(() => {
    fetchProducts();
  }, [categoryId]);
  
  // 4. Handlers
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 5. Render helpers
  const renderProduct = (product: Product) => (
    <div key={product.id} className="product-card">
      {/* Product content */}
    </div>
  );
  
  // 6. Main render
  return (
    <div className="product-list">
      {loading ? <Skeleton /> : products.map(renderProduct)}
    </div>
  );
};

export default ProductList;
```

### Functional Components

**Always use functional components with hooks:**
```typescript
// ✅ Good
const MyComponent: React.FC = () => {
  const [state, setState] = useState();
  return <div />;
};

// ❌ Bad
class MyComponent extends React.Component {
  render() { return <div />; }
}
```

---

## 🔄 State Management

### Context API Pattern

**Create Context:**
```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**Use Context:**
```typescript
const MyComponent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
};
```

---

## 🌐 API Integration

### Service Pattern

```typescript
// services/productService.ts
import axios from 'axios';
import { API_BASE_URL } from '../config';

const productService = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },
  
  create: async (product: CreateProductDTO) => {
    const response = await axios.post(`${API_BASE_URL}/products`, product);
    return response.data;
  },
  
  update: async (id: number, product: UpdateProductDTO) => {
    const response = await axios.put(`${API_BASE_URL}/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: number) => {
    await axios.delete(`${API_BASE_URL}/products/${id}`);
  }
};

export default productService;
```

### Axios Interceptors

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🎨 Styling Guide

### CSS Variables

**Always use theme variables:**
```css
/* ✅ Good */
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--spacing-md);
}

/* ❌ Bad */
.component {
  background: #ffffff;
  color: #000000;
  padding: 16px;
}
```

### Component CSS Structure

```css
/* ProductList.css */

/* 1. Container */
.product-list-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

/* 2. Header */
.product-list-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

/* 3. Grid/List */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

/* 4. Items */
.product-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

/* 5. States */
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* 6. Responsive */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## ➕ Adding New Features

### Step-by-Step Guide

**1. Create Component:**
```bash
# Create folder
mkdir src/components/NewFeature

# Create files
touch src/components/NewFeature/NewFeature.tsx
touch src/components/NewFeature/NewFeature.css
```

**2. Define Types:**
```typescript
// types/newFeature.ts
export interface NewFeature {
  id: number;
  name: string;
  createdAt: Date;
}

export interface CreateNewFeatureDTO {
  name: string;
}
```

**3. Create Service:**
```typescript
// services/newFeatureService.ts
import api from './api';

const newFeatureService = {
  getAll: async () => {
    const response = await api.get('/newfeature');
    return response.data;
  },
  
  create: async (data: CreateNewFeatureDTO) => {
    const response = await api.post('/newfeature', data);
    return response.data;
  }
};

export default newFeatureService;
```

**4. Create Component:**
```typescript
// components/NewFeature/NewFeature.tsx
import React, { useState, useEffect } from 'react';
import newFeatureService from '../../services/newFeatureService';
import './NewFeature.css';

const NewFeature: React.FC = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const result = await newFeatureService.getAll();
    setData(result);
  };
  
  return (
    <div className="new-feature">
      {/* Component content */}
    </div>
  );
};

export default NewFeature;
```

**5. Add Route:**
```typescript
// App.tsx
import NewFeature from './components/NewFeature/NewFeature';

<Route path="/newfeature" element={<NewFeature />} />
```

**6. Add to Navigation:**
```typescript
// Navbar.tsx
const menuItems = [
  // ...existing items
  { path: '/newfeature', label: 'New Feature', icon: 'fa-star' }
];
```

---

## 🧪 Testing

### Unit Testing (TODO)

```typescript
// ProductList.test.tsx
import { render, screen } from '@testing-library/react';
import ProductList from './ProductList';

describe('ProductList', () => {
  it('renders product list', () => {
    render(<ProductList />);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });
});
```

### Integration Testing (TODO)

```typescript
// Add tests for API integration
```

---

## 🐛 Debugging

### Browser DevTools

**React DevTools:**
- Install React DevTools extension
- Inspect component state and props
- Track renders

**Console Logging:**
```typescript
// Use console.log strategically
console.log('Component mounted', { props, state });

// Remove before production
```

**Network Tab:**
- Monitor API calls
- Check request/response
- Verify headers

### VS Code Debugging

**launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/restaurant-pos-client/src"
    }
  ]
}
```

---

## ✅ Best Practices

### 1. Component Design
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use composition over inheritance

### 2. Performance
- Memoize expensive calculations with `useMemo`
- Prevent unnecessary renders with `useCallback`
- Lazy load components with `React.lazy()`

### 3. Error Handling
```typescript
try {
  await apiCall();
} catch (error) {
  console.error('Error:', error);
  showToast('Error message', 'error');
}
```

### 4. TypeScript
- Always define types for props
- Avoid `any` type
- Use interfaces for object shapes

### 5. Security
- Never store sensitive data in localStorage
- Validate all user inputs
- Sanitize data before displaying

---

## 🔄 Common Patterns

### Loading Pattern
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchData();
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);

if (loading) return <Skeleton />;
```

### Error Pattern
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await apiCall();
} catch (err) {
  setError(err.message);
}

if (error) return <ErrorMessage message={error} />;
```

### Form Pattern
```typescript
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await submitForm(formData);
};
```

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [.NET Documentation](https://docs.microsoft.com/dotnet/)

---

**Happy Coding!** 🚀

**Version:** 2.0.0  
**Last Updated:** January 15, 2024
