## README_FRONTEND - Universidad Digital

### 1. Objetivo

Este frontend consume el backend real de Universidad Digital (FastAPI) y aplica:

- Rutas protegidas por rol
- Autenticación real (JWT / Cookies HttpOnly)
- Formularios validados
- Accesibilidad WCAG 2.1 AA
- Seguridad y hardening OWASP Frontend

### 2. Estructura de carpetas

```
frontend/
 ├── src/
 │   ├── api/            # Cliente Axios, interceptores, endpoints
 │   ├── auth/           # Tokens en memoria
 │   ├── components/     # UI reusable
 │   ├── pages/          # Vistas por rol/caso de uso
 │   ├── layouts/        # Layouts base
 │   ├── hooks/          # Hooks personalizados
 │   ├── context/        # Estado global de auth
 │   ├── services/       # Lógica de negocio frontend
 │   ├── routes/         # Rutas públicas y protegidas
 │   ├── utils/          # Helpers y sanitización
 │   ├── styles/         # Estilos globales
 │   └── main.tsx
 └── package.json
```

### 3. Variables de entorno

Crear `frontend/.env` basado en `frontend/.env.example`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 4. Instalación y ejecución

```
cd frontend
npm install
npm run dev
```

La app se levanta en `http://localhost:3000`.

### 5. Flujo de autenticación

1) Login en `/auth/login` devuelve JWT.
2) El token se guarda solo en **memoria** (no LocalStorage).
3) Axios usa interceptores para adjuntar `Authorization` si existe token.
4) Si el backend usa cookie HttpOnly, se envía con `withCredentials`.
5) `/auth/me` valida la sesión y retorna roles.

Además, en vistas de inscripciones y calificaciones se consumen campos descriptivos opcionales del backend
(`subject_name`, `period_name`, `user_full_name`, `enrollment_label`) con fallback a IDs para mantener compatibilidad.

### 6. Seguridad aplicada (OWASP Frontend)

- Sin LocalStorage para JWT.
- Interceptores centralizados de Axios.
- Manejo de sesión expirada (401 -> logout).
- Sanitización básica de entradas (evita XSS simple).
- Errores controlados y mensajes limpios.
- Variables sensibles solo en `.env`.

### 7. Accesibilidad (WCAG 2.1 AA)

- Formularios con `label` asociado a `input`.
- Mensajes de error con `role="alert"`.
- Navegación con teclado (HTML semántico).
- Contraste base alto en botones y alertas.
- Estructura semántica con `main`, `header`, `nav`.

Limitaciones conocidas:
- Las tablas no usan paginación ni ordenamiento aún.
- El modal es básico (no gestiona foco interno).

### 8. Auditoría final (resumen)

**Calidad de código**
- SoC y SRP aplicados (api, servicios, pages, components).
- Tipado estricto TypeScript.
- Componentes reutilizables con props tipadas.

**Seguridad**
- Tokens solo en memoria.
- Interceptores con manejo de 401.
- Sin exposición de detalles internos.

**Accesibilidad**
- Inputs con labels.
- Alertas con `role="alert"`.
- Navegación visible y semántica.

**UX**
- Mensajes claros en formularios.
- Flujos por rol separados.

### 10. Testing Strategy

**Framework & Tools:**
- **Unit Tests:** Vitest + React Testing Library
- **Integration Tests:** Vitest + React Testing Library (component + API interactions)
- **E2E Tests:** Playwright (complete user workflows)

**Test Structure:**

```
frontend/tests/
├── unit/                          # Isolated component logic
│   ├── Button.test.tsx           # Single component tests
│   ├── Input.test.tsx            # Input validation and states
│   ├── Modal.test.tsx            # Modal interactions
│   └── Select.test.tsx           # Select dropdowns
├── integration/                   # Component + API interactions
│   ├── LoginPage.integration.test.tsx      # 8 tests: form, auth, validation
│   ├── AppRoutes.integration.test.tsx      # 9 tests: routing, RBAC
│   └── Table.integration.test.tsx          # 13 tests: sorting, pagination
└── e2e/                           # Complete user journeys
    ├── complete-flows.e2e.test.ts # 15 tests: student/teacher/admin flows
    └── auth-security.e2e.test.ts  # Security & validation flows
```

**Test Counts:**
- **Unit Tests:** ~25 tests (Button, Input, Modal, Select)
- **Integration Tests:** ~30 tests (LoginPage, AppRoutes, Table, Forms)
- **E2E Tests:** ~15 tests (complete user flows)
- **Total:** ~70 frontend tests

**Test Pyramid:** 40% Unit | 45% Integration | 15% E2E

**Running Tests:**

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# All tests with coverage
npm run test:unit && npm run test:integration

# Watch mode
npm run test:watch

# With coverage report
npm run coverage

# E2E tests (Playwright)
npm run test:e2e
```

**Test Markers:**
- `@unit` - Unit test
- `@integration` - Integration test
- `@e2e` - End-to-end test
- `@security` - Security-focused test
- `@a11y` - Accessibility test

**Test Examples:**

**LoginPage Integration Test (8 tests:**
1. Form renders with fields
2. Successful login + navigation
3. Token persisted to localStorage
4. Invalid credentials show error
5. No navigation on failure
6. 401 Unauthorized handling
7. Email validation
8. Password masking

**AppRoutes Integration Test (9 tests):**
1. Public routes accessible without auth
2. Protected routes redirect to login
3. Role-based access control (admin/student/teacher)
4. Admin-only routes deny non-admin
5. 404 for invalid routes
6. Loading states handled
7. Inactive user access denied
8. Navigation maintains auth state
9. Session expiration triggers logout

**Complete E2E Test (15 tests):**
1. Student enrollment flow (register → login → enroll → view grades)
2. Teacher grading flow (view students → enter grades → confirm)
3. Admin user management (create → assign roles → deactivate)
4. Invalid credentials prevent login
5. Logout redirects to login
6. RBAC enforcement (student cannot access admin)
7. Protected routes block unauthenticated access
8. Navigation menu displays correctly
9. Form validation on client side
10. Performance: dashboard loads <10s

**Coverage Targets:**
- Statement Coverage: 85%
- Branch Coverage: 80%
- Function Coverage: 85%
- Line Coverage: 85%

**CI/CD Integration:**
- GitHub Actions workflow: `frontend-tests.yml`
- Runs on: push to main/develop, PR to main/develop
- Matrix: Node.js 18.x, 20.x
- Coverage uploaded to Codecov
- PR comments with coverage diffs

**Best Practices Applied:**
1. Arrange-Act-Assert (AAA) pattern
2. User-centric testing (user events, not implementation)
3. Component isolation with mocked APIs
4. Test data factories for consistency
5. Async handling with waitFor/userEvent
6. Accessibility assertions (@testing-library/jest-dom)
7. No hard dependencies on CSS classes (prefer roles/labels)
8. Error boundary testing for React components

### 9. Rutas disponibles

Públicas:
- `/login`
- `/denied`
- `/500`

Protegidas:
- `/admin` y subsecciones
- `/teacher` y subsecciones
- `/student` y subsecciones

### 11. Verificación responsive (móvil)

- Abre Chrome DevTools (`F12` → Toggle Device Toolbar) y prueba anchos de **320px, 375px y 768px**.
- Verifica especialmente `/login`, dashboards y páginas con tablas (`/admin/*`, `/teacher/grades`, `/student/*`).
- Si alguna vista vuelve a desbordar horizontalmente, revisa primero:
  - contenedores con ancho fijo (`width/min-width`),
  - elementos `100vh` en móvil (preferir `100dvh`),
  - tablas sin contenedor con `overflow-x: auto`.
