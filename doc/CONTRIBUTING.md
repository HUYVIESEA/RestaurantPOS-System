# 🤝 Contributing to Restaurant POS System

**Version:** 2.0.0  
**Last Updated:** January 15, 2024

Thank you for your interest in contributing to Restaurant POS System! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Feature Requests](#feature-requests)
9. [Testing Guidelines](#testing-guidelines)
10. [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

**Positive behavior includes:**
- ✅ Using welcoming and inclusive language
- ✅ Being respectful of differing viewpoints
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community
- ✅ Showing empathy towards other members

**Unacceptable behavior includes:**
- ❌ Trolling, insulting, or derogatory comments
- ❌ Personal or political attacks
- ❌ Public or private harassment
- ❌ Publishing others' private information
- ❌ Other unethical or unprofessional conduct

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- ✅ Git installed
- ✅ Node.js >= 18.0.0
- ✅ .NET SDK 8.0
- ✅ SQL Server 2019+
- ✅ A GitHub account

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# Click "Fork" button at https://github.com/HUYVESEA0/RestaurantPOS-System

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/RestaurantPOS-System.git
cd RestaurantPOS-System

# 3. Add upstream remote
git remote add upstream https://github.com/HUYVESEA0/RestaurantPOS-System.git

# 4. Verify remotes
git remote -v
```

### Setup Development Environment

```bash
# Run automated setup
setup.bat

# Or manual setup
cd restaurant-pos-client
npm install
cd ../RestaurantPOS.API
dotnet restore
```

---

## 🔄 Development Workflow

### Branch Strategy

We follow **Git Flow** branching model:

```
main (production)
  ↓
develop (development)
  ↓
feature/your-feature-name (new features)
bugfix/your-bug-name (bug fixes)
hotfix/your-hotfix-name (urgent fixes)
```

### Creating a Feature Branch

```bash
# 1. Update develop branch
git checkout develop
git pull upstream develop

# 2. Create feature branch
git checkout -b feature/add-payment-integration

# 3. Make your changes
# ... code changes ...

# 4. Commit changes
git add .
git commit -m "feat: add payment integration"

# 5. Push to your fork
git push origin feature/add-payment-integration

# 6. Create Pull Request on GitHub
```

### Branch Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/add-dark-mode` |
| Bug Fix | `bugfix/description` | `bugfix/fix-login-error` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Documentation | `docs/description` | `docs/update-readme` |
| Refactor | `refactor/description` | `refactor/optimize-queries` |

---

## 📝 Coding Standards

### Frontend (TypeScript/React)

**File Structure:**
```typescript
// ProductList.tsx
import React, { useState, useEffect } from 'react';
import './ProductList.css';

interface ProductListProps {
  categoryId?: number;
}

const ProductList: React.FC<ProductListProps> = ({ categoryId }) => {
  // 1. State declarations
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Hooks
  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  // 3. Functions
  const fetchProducts = async () => {
    // Implementation
  };

  // 4. Render
  return (
    <div className="product-list">
      {/* JSX */}
    </div>
  );
};

export default ProductList;
```

**Naming Conventions:**
```typescript
// Components: PascalCase
const ProductList: React.FC = () => {};

// Functions/Variables: camelCase
const handleSubmit = () => {};
const userName = 'John';

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000';

// Interfaces: PascalCase with 'I' prefix
interface IProduct {
  id: number;
  name: string;
}

// Types: PascalCase
type ProductStatus = 'available' | 'unavailable';
```

**Code Style:**
```typescript
// ✅ Good
const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// ❌ Bad
const getProductById = async (id) => {
  const response = await api.get('/products/' + id);
  return response.data;
};
```

### Backend (C#/.NET)

**Naming Conventions:**
```csharp
// Classes: PascalCase
public class ProductService {}

// Methods: PascalCase
public async Task<Product> GetProductByIdAsync(int id) {}

// Variables: camelCase
private string userName;

// Constants: PascalCase
public const string ApiVersion = "v1";

// Interfaces: PascalCase with 'I' prefix
public interface IProductService {}
```

**Code Style:**
```csharp
// ✅ Good
public async Task<IActionResult> GetProducts()
{
    try
    {
        var products = await _productService.GetAllAsync();
        return Ok(products);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching products");
        return StatusCode(500, "Internal server error");
    }
}

// ❌ Bad
public IActionResult GetProducts()
{
    var products = _productService.GetAll();
    return Ok(products);
}
```

### CSS Standards

```css
/* Component-specific classes */
.product-list {
  /* Use CSS variables */
  background: var(--bg-primary);
  padding: var(--spacing-lg);
}

/* Use BEM naming for complex components */
.product-card__header {}
.product-card__body {}
.product-card__footer {}

/* Mobile-first approach */
.product-grid {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 💬 Commit Guidelines

### Commit Message Format

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(products): add grid view` |
| `fix` | Bug fix | `fix(auth): resolve token expiration` |
| `docs` | Documentation | `docs(api): update endpoints` |
| `style` | Code style | `style: format code` |
| `refactor` | Code refactor | `refactor(services): optimize queries` |
| `test` | Add tests | `test(products): add unit tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance | `perf(orders): optimize loading` |

### Examples

**Good commits:**
```bash
feat(dark-mode): implement theme toggle
fix(login): resolve email validation bug
docs(readme): add installation instructions
refactor(api): extract service layer
test(products): add integration tests
```

**Bad commits:**
```bash
# ❌ Too vague
update files
fix bug

# ❌ Not following format
Added new feature for products
Fixed the login page
```

### Detailed Commit Message

```bash
feat(payment): integrate Stripe payment gateway

- Add Stripe SDK integration
- Create payment service
- Implement checkout flow
- Add payment confirmation page

Closes #123
```

---

## 🔀 Pull Request Process

### Before Creating PR

**Checklist:**
- [ ] Code follows project coding standards
- [ ] All tests pass (`npm test` / `dotnet test`)
- [ ] No console errors or warnings
- [ ] Code is properly commented
- [ ] Documentation updated (if needed)
- [ ] Tested on multiple browsers/devices
- [ ] Branch is up to date with `develop`

### Creating Pull Request

1. **Push your branch:**
```bash
git push origin feature/your-feature-name
```

2. **Create PR on GitHub:**
- Go to repository on GitHub
- Click "Pull Requests" → "New Pull Request"
- Select `develop` as base branch
- Select your feature branch
- Fill in PR template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests pass locally

## Related Issues
Closes #123
Related to #456
```

### Review Process

**What reviewers check:**
- ✅ Code quality and style
- ✅ Functionality works as expected
- ✅ No security vulnerabilities
- ✅ Performance impact
- ✅ Test coverage
- ✅ Documentation completeness

**Response time:**
- Initial review: Within 48 hours
- Follow-up: Within 24 hours

---

## 🐛 Issue Reporting

### Before Creating an Issue

**Search existing issues:**
- Check if issue already reported
- Look in closed issues too
- Check FAQ and documentation

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
[Add screenshots]

## Environment
- OS: Windows 10
- Browser: Chrome 120
- Node: 18.0.0
- .NET: 8.0

## Additional Context
Any other relevant information
```

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvement |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority: high` | High priority |
| `priority: low` | Low priority |

---

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature

## Problem it Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches considered

## Additional Context
Screenshots, mockups, etc.
```

### Feature Proposal Process

1. **Create issue** with feature request template
2. **Discussion** with maintainers and community
3. **Approval** by maintainers
4. **Implementation** by contributor
5. **Review** and merge

---

## 🧪 Testing Guidelines

### Frontend Testing

**Unit Tests (TODO):**
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

**Running Tests:**
```bash
cd restaurant-pos-client
npm test
npm run test:coverage
```

### Backend Testing

**Unit Tests (TODO):**
```csharp
[Fact]
public async Task GetProductById_ReturnsProduct()
{
    // Arrange
    var productId = 1;
    
    // Act
    var result = await _service.GetProductByIdAsync(productId);
    
    // Assert
    Assert.NotNull(result);
}
```

**Running Tests:**
```bash
cd RestaurantPOS.API
dotnet test
```

---

## 📚 Documentation

### What to Document

**Code Documentation:**
```typescript
/**
 * Fetches all products from the API
 * @param categoryId - Optional category filter
 * @returns Promise<Product[]>
 * @throws Error if API call fails
 */
const fetchProducts = async (categoryId?: number): Promise<Product[]> => {
  // Implementation
};
```

**README Updates:**
- New features
- Changed APIs
- Installation steps
- Configuration changes

**API Documentation:**
- New endpoints
- Changed request/response formats
- Authentication changes

---

## 🏆 Recognition

### Contributors

All contributors will be:
- ✅ Listed in CONTRIBUTORS.md
- ✅ Mentioned in release notes
- ✅ Credited in commit history

### Becoming a Maintainer

Active contributors may be invited to become maintainers with:
- ✅ Merge access
- ✅ Issue triage rights
- ✅ Release management

**Criteria:**
- Regular contributions
- High-quality code
- Helpful in reviews
- Active in discussions

---

## ❓ Questions?

**Have questions about contributing?**
- 📧 Email: contribute@bundaumet.com
- 💬 GitHub Discussions: [Link]
- 📝 Create an issue with label `question`

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make this project better for everyone!

**Happy Coding!** 🚀

---

**Last Updated:** January 15, 2024  
**Version:** 2.0.0
