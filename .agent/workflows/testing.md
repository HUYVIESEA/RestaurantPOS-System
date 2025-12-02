---
description: Chạy tests và quality checks cho dự án
---

# Testing & Quality Checks

Workflow này hướng dẫn chạy tests và kiểm tra chất lượng code.

## Test Structure

```
RestaurantPOS-System/
├── RestaurantPOS.API.Tests/        # Backend unit tests
├── restaurant-pos-client/
│   ├── __tests__/                  # Frontend tests
│   └── e2e/                        # E2E tests
└── RestaurantPOS.Android/
    └── app/src/test/               # Android unit tests
```

## Backend Testing (.NET)

### Setup Test Project (nếu chưa có)

```powershell
cd RestaurantPOS-System

# Tạo test project
dotnet new xunit -n RestaurantPOS.API.Tests
cd RestaurantPOS.API.Tests

# Add reference to main project
dotnet add reference ..\RestaurantPOS.API\RestaurantPOS.API.csproj

# Add test packages
dotnet add package Microsoft.AspNetCore.Mvc.Testing
dotnet add package Moq
dotnet add package FluentAssertions
```

### Run Backend Tests

**Chạy tất cả tests:**
```powershell
cd RestaurantPOS.API.Tests
dotnet test
```

**Chạy với verbose output:**
```powershell
dotnet test --verbosity detailed
```

**Chạy với coverage:**
```powershell
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

**Chạy specific test:**
```powershell
dotnet test --filter "FullyQualifiedName~AuthServiceTests"
```

### Example Unit Test

```csharp
// AuthServiceTests.cs
public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepoMock = new Mock<IUserRepository>();
        _authService = new AuthService(_userRepoMock.Object);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var user = new User { Email = "test@test.com", Password = "hashed" };
        _userRepoMock.Setup(x => x.GetByEmail("test@test.com"))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.Login("test@test.com", "password");

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeEmpty();
    }
}
```

## Frontend Testing (React)

### Setup Testing (nếu chưa có)

```powershell
cd restaurant-pos-client

# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
npm install --save-dev @testing-library/user-event
```

**Cấu hình Vitest:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### Run Frontend Tests

**Chạy tests:**
```powershell
cd restaurant-pos-client
npm run test
```

**Watch mode:**
```powershell
npm run test:watch
```

**Coverage:**
```powershell
npm run test:coverage
```

### Example Component Test

```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
  });
});
```

## Android Testing

### Run Android Unit Tests

```powershell
cd RestaurantPOS.Android
.\gradlew test
```

**Specific variant:**
```powershell
.\gradlew testDebugUnitTest
.\gradlew testReleaseUnitTest
```

**With coverage:**
```powershell
.\gradlew testDebugUnitTest jacocoTestReport
```

### Run Android Instrumentation Tests

```powershell
# Cần device/emulator đang chạy
.\gradlew connectedAndroidTest
```

### Example Android Test

```kotlin
// OrderViewModelTest.kt
class OrderViewModelTest {
    private lateinit var viewModel: OrderViewModel
    private lateinit var repository: MockOrderRepository

    @Before
    fun setup() {
        repository = MockOrderRepository()
        viewModel = OrderViewModel(repository)
    }

    @Test
    fun `createOrder should add order to list`() = runTest {
        // Arrange
        val order = Order(items = listOf())

        // Act
        viewModel.createOrder(order)

        // Assert
        val orders = viewModel.orders.value
        assertTrue(orders.contains(order))
    }
}
```

## Integration Tests

### Backend API Integration Tests

```powershell
cd RestaurantPOS.API.Tests
dotnet test --filter "Category=Integration"
```

**Example:**
```csharp
public class ProductsApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ProductsApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/products");

        // Assert
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();
        products.Should().NotBeNull();
    }
}
```

## E2E Tests (Playwright - Future)

### Setup Playwright

```powershell
cd restaurant-pos-client
npm install --save-dev @playwright/test
npx playwright install
```

### Run E2E Tests

```powershell
npx playwright test
```

**With UI:**
```powershell
npx playwright test --ui
```

**Specific browser:**
```powershell
npx playwright test --browser=chromium
npx playwright test --browser=firefox
```

## Code Quality Checks

### Backend Linting

**Format check:**
```powershell
cd RestaurantPOS.API
dotnet format --verify-no-changes
```

**Format fix:**
```powershell
dotnet format
```

### Frontend Linting

**Check:**
```powershell
cd restaurant-pos-client
npm run lint
```

**Fix:**
```powershell
npm run lint:fix
```

### Type Checking

**TypeScript:**
```powershell
npm run type-check
```

## Performance Testing

### Backend Load Testing (k6)

**Install k6:**
```powershell
choco install k6
```

**Create test script:**
```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  let response = http.get('http://localhost:5000/api/products');
  check(response, { 'status was 200': (r) => r.status == 200 });
}
```

**Run:**
```powershell
k6 run load-test.js
```

### Frontend Performance

**Lighthouse:**
```powershell
npm install -g lighthouse
lighthouse http://localhost:5173
```

## Security Testing

### Dependency Audit

**Backend:**
```powershell
cd RestaurantPOS.API
dotnet list package --vulnerable
```

**Frontend:**
```powershell
cd restaurant-pos-client
npm audit
```

**Fix vulnerabilities:**
```powershell
npm audit fix
```

## Test Coverage

### Backend Coverage

**Generate coverage report:**
```powershell
cd RestaurantPOS.API.Tests
dotnet test /p:CollectCoverage=true /p:CoverletOutput=./coverage/ /p:CoverletOutputFormat=lcov
```

**View report:**
```powershell
# Install reportgenerator
dotnet tool install -g dotnet-reportgenerator-globaltool

# Generate HTML report
reportgenerator -reports:coverage/coverage.info -targetdir:coverage/report
```

### Frontend Coverage

```powershell
cd restaurant-pos-client
npm run test:coverage
```

**View report:**
- Open `coverage/index.html` in browser

## CI/CD Testing

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - run: dotnet restore
      - run: dotnet build
      - run: dotnet test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
```

## Test Checklist

Trước khi commit/deploy:

- [ ] Backend unit tests pass
- [ ] Frontend unit tests pass
- [ ] Android tests pass (if changed)
- [ ] Integration tests pass
- [ ] No linting errors
- [ ] Type checking passes
- [ ] Security audit clean
- [ ] Test coverage > 70%
- [ ] Manual smoke tests done

## Best Practices

1. **Write tests BEFORE fixing bugs**
2. **Test edge cases and error scenarios**
3. **Keep tests independent**
4. **Use descriptive test names**
5. **Mock external dependencies**
6. **Test user flows, not implementation**
7. **Maintain test data fixtures**
8. **Run tests before committing**

## Troubleshooting

### Tests Failing Randomly

**Backend:**
- Check async/await properly
- Verify database state reset
- Check for race conditions

**Frontend:**
- Use waitFor for async operations
- Clear mocks between tests
- Check for state leaks

### Slow Tests

**Backend:**
- Use in-memory database for tests
- Parallelize tests
- Mock slow operations

**Frontend:**
- Mock API calls
- Use shallow rendering when possible
- Split into smaller test files

## Next Steps

- Setup CI/CD pipeline
- Add more test coverage
- Implement E2E tests
- Setup automated testing on PR
