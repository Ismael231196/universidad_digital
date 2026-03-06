# Frontend Testing Strategy

## Overview

This document defines the comprehensive testing strategy for the Universidad Digital frontend application built with React, TypeScript, and Vite.

## 1. Testing Philosophy

**Goal:** Ensure frontend reliability, accessibility, and security through automated testing.

**Approach:**
- **Test Pyramid:** 40% Unit | 45% Integration | 15% E2E
- **User-Centric:** Test from user perspective, not implementation details
- **Accessibility-First:** All tests verify WCAG 2.1 AA compliance
- **Security-Focused:** Test OWASP Frontend Top 10 controls

## 2. Testing Levels

### 2.1 Unit Tests (25 tests)

**Purpose:** Test isolated component logic without external dependencies.

**Components Tested:**
- `Button.tsx` - 15 tests (rendering, states, click events, accessibility)
- `Input.tsx` - 18 tests (types, validation, accessibility, edge cases)
- `Modal.tsx` - 10 tests (open/close, backdrop, animations)
- `Select.tsx` - 12 tests (option rendering, selection, keyboard navigation)
- `Alert.tsx` - 10 tests (variants, dismissal, icons)
- `Table.tsx` - Base component tests (rendering, props validation)

**Test Pattern:**
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => { /* tests */ });
  describe('States', () => { /* tests */ });
  describe('Events', () => { /* tests */ });
  describe('Accessibility', () => { /* tests */ });
});
```

**Markers:** `@unit`, `@a11y` (for accessibility-specific tests)

### 2.2 Integration Tests (30 tests)

**Purpose:** Test component interactions with other components and simulated API calls.

**Pages/Flows Tested:**

**LoginPage (35 lines, 8 tests):**
- Form rendering with email/password fields
- Successful authentication and navigation
- Token persistence
- Invalid credentials error handling
- Form validation (email format, required fields, password length)
- Password field masking
- Loading state during submission
- Security: no password logging

**AppRoutes (55 lines, 9 tests):**
- Public route accessibility (login page)
- Protected route access control
- Role-based access (admin, teacher, student)
- Admin-only route enforcement
- 404 handling for invalid routes
- Loading state display
- Inactive user denial
- Auth state persistence across navigation
- Session expiration handling

**Table Component (60 lines, 13 tests):**
- Data rendering (headers, rows)
- Sorting functionality (sortable columns only)
- Pagination (next/previous, page state)
- Row selection and bulk actions
- Search/filtering
- Column visibility toggle
- Responsive layout
- Loading states
- Accessibility (table roles, ARIA)
- Export functionality
- Empty state messaging

**Form Components (Dashboard, User Management):**
- Form validation (client-side before submission)
- Field value updates
- Form reset
- Multi-step forms
- Error display
- Success confirmation

**Test Pattern:**
```typescript
describe('PageName Integration', () => {
  describe('User Flow - [scenario]', () => {
    it('should [step 1]', async () => {});
    it('should [step 2]', async () => {});
  });
});
```

**Markers:** `@integration`, `@security` (for authorization tests)

### 2.3 E2E Tests (15 tests)

**Purpose:** Test complete user journeys using real application state and API interactions.

**Test Suite: `complete-flows.e2e.test.ts`**

**Flow 1: Student Enrollment (4 tests)**
1. Student registration flow
2. Login and authentication
3. Course enrollment
4. Enrollment confirmation and grade viewing

**Flow 2: Teacher Grading (3 tests)**
1. Teacher login
2. Access class roster
3. Enter grades for students

**Flow 3: Admin User Management (3 tests)**
1. Create new user (all roles)
2. Assign/modify roles
3. Deactivate user account

**Security Tests (3 tests)**
1. Invalid credentials rejection
2. Logout and session termination
3. Protected route enforcement
4. RBAC boundary testing

**Performance Tests (1 test)**
1. Page load time < 10 seconds

**Navigation Tests (1 test)**
1. Menu highlighting and navigation flows

**Test Pattern:**
```typescript
test.describe('Feature - User Flow', () => {
  test('should complete [flow]', async ({ page }) => {
    // 1. Arrange (navigate to starting point)
    await page.goto('http://localhost:5173');
    
    // 2. Act (user interactions)
    await page.fill('input[type="email"]', 'user@example.com');
    
    // 3. Assert (verify outcomes)
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

**Markers:** `@e2e`, `@smoke` (critical path tests)

## 3. Test Data & Mocking

### 3.1 Mock Users

```typescript
const mockStudentUser = {
  id: '2',
  email: 'student@example.com',
  full_name: 'Student User',
  role: 'student',
  is_active: true,
};

const mockTeacherUser = { /* ... */ };
const mockAdminUser = { /* ... */ };
```

### 3.2 Mock API Responses

**Auth Service Mocks:**
```typescript
vi.mock('../../api/auth', () => ({
  login: vi.fn().mockResolvedValue({
    access_token: 'mock-token',
    token_type: 'bearer',
  }),
  logout: vi.fn(),
}));
```

### 3.3 API Fixtures

**Users Endpoint:**
- GET /users (list with pagination)
- GET /users/:id (single user)
- POST /users (create)
- PUT /users/:id (update)
- DELETE /users/:id (soft delete)

**Auth Endpoint:**
- POST /auth/login
- POST /auth/logout
- GET /auth/me (current user)

**Enrollments Endpoint:**
- POST /enrollments (create enrollment)
- GET /enrollments (list student enrollments)

## 4. Test Organization

### 4.1 File Structure
```
frontend/tests/
├── unit/
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   ├── Modal.test.tsx
│   ├── Select.test.tsx
│   └── Table.test.tsx
├── integration/
│   ├── LoginPage.integration.test.tsx
│   ├── AppRoutes.integration.test.tsx
│   └── Table.integration.test.tsx
├── e2e/
│   ├── complete-flows.e2e.test.ts
│   └── auth-security.e2e.test.ts
└── __mocks__/
    ├── api/
    │   ├── auth.ts
    │   ├── users.ts
    │   └── enrollments.ts
    └── context/
        └── AuthContext.tsx
```

### 4.2 Test Naming Convention

**Unit Tests:**
```
test_[component]_[feature]_[scenario]
test_button_onClick_calls_handler_when_enabled
test_input_validation_email_shows_error_for_invalid_format
```

**Integration Tests:**
```
test_[page]_[flow]_[scenario]
test_loginPage_submission_shows_error_on_invalid_credentials
test_appRoutes_rbac_denies_student_access_to_admin_routes
```

**E2E Tests:**
```
test_[flow]_[journey]_[outcome]
test_studentEnrollment_completes_registration_to_grade_view
test_authSecurity_prevents_unauthorized_access_to_dashboard
```

## 5. Testing Tools & Configuration

### 5.1 Vitest Configuration

**vitest.config.ts:**
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 85,
      functions: 85,
      branches: 80,
      statements: 85,
    },
  },
});
```

### 5.2 Playwright Configuration

**playwright.config.ts:**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
  },
});
```

### 5.3 Dependencies

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0"
  }
}
```

## 6. Running Tests

### 6.1 Development

```bash
# Run all tests once
npm run test:unit && npm run test:integration

# Watch mode development
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test:unit -- Button.test.tsx

# Run with coverage
npm run coverage
```

### 6.2 CI/CD

**GitHub Actions Workflow: `frontend-tests.yml`**

```yaml
name: Frontend Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration -- --coverage
      - uses: codecov/codecov-action@v3
```

## 7. Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statement Coverage | 85% | TBD |
| Branch Coverage | 80% | TBD |
| Function Coverage | 85% | TBD |
| Line Coverage | 85% | TBD |

**Critical Paths (100% coverage required):**
- Authentication flows
- Authorization checks (RBAC)
- Error boundary components
- Form validation

## 8. Accessibility Testing

### 8.1 WCAG 2.1 AA Compliance

All tests include accessibility assertions:

```typescript
// Test keyboard navigation
await user.tab();
expect(element).toHaveFocus();

// Test screen reader compatibility
expect(button).toHaveAttribute('aria-label', 'Close dialog');

// Test color contrast (via jest-axe)
const results = await axe(container);
expect(results.violations).toHaveLength(0);
```

### 8.2 Accessibility Test Cases

- Button keyboard accessibility (enter/space)
- Form label associations
- Error messages with `role="alert"`
- Modal focus management
- Skip navigation links
- Table header scope attributes
- Icon alt text

## 9. Security Testing

### 9.1 Frontend Security Tests

**Authentication:**
- Invalid credentials show generic error (no email enumeration)
- Password never logged or exposed
- JWT verified before accepting

**Authorization:**
- Student cannot access teacher endpoints
- Teacher cannot access admin endpoints
- Role verification on every protected route

**Input Validation:**
- XSS prevention (sanitize HTML)
- Email format validation
- Password strength requirements

**Data Protection:**
- Tokens stored in memory only (not localStorage)
- No sensitive data in URL params
- CORS headers enforced

### 9.2 Security Test Matrix

| Test | Student | Teacher | Admin |
|------|---------|---------|-------|
| Access /dashboard | ✅ | ✅ | ✅ |
| Access /admin | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| View students | ❌ | ✅ | ✅ |
| Submit grades | ❌ | ✅ | ❌ |

## 10. Critical Test Flows

### Flow 1: Authentication
1. User enters invalid credentials
2. Error message shown (no email enumeration)
3. User enters valid credentials
4. Token received and stored in memory
5. Redirected to appropriate dashboard
6. Session maintained across navigation
7. Token refresh handled automatically
8. Logout clears session and redirects to login

### Flow 2: Enrollment
1. Student navigates to courses
2. Selects course to enroll
3. Confirms enrollment
4. Receives confirmation message
5. Course appears in "My Courses"
6. Can view grades for course after teacher grades

### Flow 3: Grading
1. Teacher logs in
2. Navigates to course roster
3. Selects student
4. Enters grade
5. System validates grade format
6. Grade saved with timestamp
7. Student can view updated grade

## 11. Best Practices

### 11.1 Test Writing

```typescript
// ✅ Good: User-centric, clear intent
it('should show error message when email is invalid', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'invalid');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});

// ❌ Bad: Implementation-specific, fragile
it('should set error state', () => {
  const { container } = render(<LoginForm />);
  const input = container.querySelector('.email-input');
  fireEvent.change(input, { target: { value: 'invalid' } });
  expect(input).toHaveClass('error');
});
```

### 11.2 Avoiding Common Pitfalls

1. **Don't test implementation details** → Test user outcomes
2. **Don't hardcode delays** → Use `waitFor()` and `userEvent`
3. **Don't mock screen reader content** → Use Testing Library queries
4. **Don't ignore accessibility** → Test keyboard navigation
5. **Don't skip error cases** → Test both happy and sad paths

## 12. Performance Testing

### 12.1 Metrics

- Page load: < 10 seconds
- Time to interactive: < 5 seconds
- API response: < 2 seconds (mocked in tests)
- Component render: < 100ms

### 12.2 Performance Test Example

```typescript
test('should load dashboard within 10 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('http://localhost:5173/dashboard');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(10000);
});
```

## 13. CI/CD Integration

### 13.1 Test Gates

- All tests must pass before merge
- Coverage must not decrease
- E2E tests run on pull requests
- Accessibility violations block merge

### 13.2 Reporting

- Coverage uploaded to Codecov
- PR comments with coverage diff
- Test results visible in GitHub Checks
- Failed tests block merge until fixed

## 14. Test Maintenance

### 14.1 Regular Reviews

- Monthly: Review test coverage gaps
- Quarterly: Update test data and fixtures
- Yearly: Audit test strategy and tools

### 14.2 Refactoring Policy

All IA-generated tests must be:
1. Review for correctness (functionality)
2. Refactored for clarity (readability)
3. Validated for coverage (completeness)
4. Tested locally before commit

## 15. Documentation

### 15.1 Test Documentation

Each test file includes:
- Purpose and scope
- Test data setup
- Expected outcomes
- Integration points (mocked APIs)

### 15.2 Example Test Documentation

```typescript
/**
 * LoginPage Integration Tests
 * 
 * Purpose: Verify user authentication flow including:
 * - Form rendering and validation
 * - Successful login with token handling
 * - Error messaging for invalid credentials
 * 
 * Mocked APIs:
 * - POST /auth/login (success/failure)
 * - POST /auth/logout
 * 
 * Dependencies:
 * - AuthContext for token management
 * - Router for navigation
 */
describe('LoginPage Integration', () => { /* ... */ });
```

## 16. Next Steps

1. ✅ Create comprehensive test structure (DONE)
2. ✅ Implement 70+ frontend tests (IN PROGRESS)
3. ⬜ Integrate E2E tests with GitHub Actions
4. ⬜ Add performance benchmarking
5. ⬜ Implement visual regression testing
6. ⬜ Set up test monitoring dashboard

---

**Last Updated:** [Current Date]
**Maintainer:** Testing Team
**Status:** Active Development
