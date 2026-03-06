# Estrategia de Testing - Universidad Digital

## Objetivo
Asegurar la calidad, confiabilidad y seguridad del sistema mediante pruebas automáticas en múltiples niveles, minimizando riesgos de negocio.

---

## 1. Pirámide de Testing (Test Pyramid)

Proporción esperada:
- **Unit Tests: 70%** → Lógica de dominio, servicios, validaciones
- **Integration Tests: 20%** → APIs, BD, integraciones entre módulos
- **E2E Tests: 10%** → Flujos críticos end-to-end

**Beneficio:** Tests rápidos en desarrollo, confianza en producción, costos bajos en mantenimiento.

---

## 2. Mapeo: Nivel de Test → Tipo de Riesgo

| Tipo de Riesgo | Nivel de Test | Ejemplo |
|---|---|---|
| Lógica de negocio defectuosa | Unit | Cálculo de notas, validación de matrícula |
| Integración entre servicios rota | Integration | Auth + Users, Enrollments + Grades |
| Flujo crítico inoperante | E2E | Login → Dashboard → Matrícula |
| Regresiones de seguridad | Unit + Security | Autenticación, autorización, validación de input |

---

## 3. Flujos Críticos del Negocio

| # | Flujo | Prioridad | Tests Requeridos |
|---|---|---|---|
| 1 | **Autenticación y sesión** | Crítica | Unit (auth services) + Integration (auth routes) + E2E (login flujo) |
| 2 | **Gestión de usuarios y roles** | Alta | Unit (permisos) + Integration (crud usuarios) |
| 3 | **Matrícula a materias** | Crítica | Unit (reglas matrícula) + Integration (enrollments) |
| 4 | **Calificaciones y reportes** | Alta | Unit (cálculos) + Integration (grades) |
| 5 | **Administración de periodos** | Media | Unit + Integration tests |
| 6 | **Gestión de materias** | Media | Unit + Integration tests |

---

## 4. Componentes Críticos Identificados

```
Backend (FastAPI)
├── app/auth/          ← CRÍTICA (autenticación, tokens, revocación)
├── app/users/         ← CRÍTICA (CRUD usuarios, permisos)
├── app/enrollments/   ← CRÍTICA (matrícula, validaciones)
├── app/grades/        ← ALTA (cálculos, médias)
├── app/roles/         ← ALTA (autorización)
├── app/subjects/      ← MEDIA (listados)
└── app/periods/       ← MEDIA (periodos académicos)

Frontend (React/Vitest)
├── components/        ← Unit tests (Button, Input, Modal, etc.)
├── pages/             ← Integration tests (LoginPage, Dashboard)
├── context/           ← Unit tests (AuthContext)
└── hooks/             ← Unit tests (useAuth, useFetch)
```

---

## 5. Estrategia por Tipo de Test

### 5.1 Unit Tests (Tests Unitarios)

**Qué prueba:**
- Funciones puras, lógica de negocio, validaciones, servicios aislados

**Características:**
- Sin BD real, sin APIs externas, sin efectos secundarios
- Rápidos (< 1 segundo por 100 tests)
- Deterministas (misma entrada = misma salida)

**Herramientas:**
- Backend: `pytest`
- Frontend: `vitest`

**Ejemplo:**
```python
@pytest.mark.unit
def test_authenticate_user_credenciales_invalidas():
    # No usa BD, solo lógica de autenticación
    with pytest.raises(UnauthorizedError):
        authenticate_user(db_mock, "email", "bad_password")
```

### 5.2 Integration Tests (Pruebas de Integración)

**Qué prueba:**
- APIs reales con BD de prueba
- Flujos entre servicios (auth → users, enrollments → grades)
- Serialización/deserialización

**Características:**
- Usan BD SQLite en memoria
- Llaman a endpoints reales
- Limpian estado entre tests

**Herramientas:**
- Backend: `pytest` + `TestClient`
- Frontend: `vitest` + React Testing Library

**Ejemplo:**
```python
@pytest.mark.integration
def test_login_y_me_flujo_basico(api_client, db_session):
    # API real, BD de prueba
    response = api_client.post("/auth/login", json=payload)
    assert response.status_code == 200
```

### 5.3 E2E Tests (Pruebas End-to-End)

**Qué prueba:**
- Flujos críticos completos en ambiente similar a producción
- Comportamiento desde la perspectiva del usuario

**Características:**
- Frontend + Backend corriendo juntos
- Pruebas lentas (1-10 segundos por test)
- Solo flujos críticos

**Herramientas:**
- Playwright o Cypress (recomendado: Playwright)
- Ejecutar solo en main branch o pre-release

**Ejemplo:**
```
Registro → Login → Dashboard → Matrícula → Verificar notas
```

---

## 6. Cobertura de Código Esperada

| Módulo | Umbral | Justificación |
|---|---|---|
| `app/auth/` | 90% | Crítica, requiere máxima confianza |
| `app/users/` | 85% | Crítica, pero menos complejidad |
| `app/enrollments/` | 88% | Crítica, reglas complejas |
| `app/grades/` | 85% | Alta, cálculos importantes |
| `app/roles/` | 80% | Cobertura esencial |
| `app/subjects/` | 75% | CRUD estándar |
| `app/periods/` | 75% | CRUD estándar |
| **Global (`app/`)** | **85%** | Umbral mínimo |

---

## 7. Marcadores (Markers) para Ejecutar Tests Selectivamente

```bash
# Ejecutar solo tests unitarios (rápido, CI)
pytest -m unit

# Ejecutar solo tests de integración
pytest -m integration

# Ejecutar solo tests E2E (después de merge en main)
pytest -m e2e

# Ejecutar solo tests de seguridad
pytest -m security

# Ejecutar todo
pytest
```

---

## 8. Ciclo de Desarrollo

### Durante desarrollo (en rama feature):
```bash
pytest -m unit --cov=app --cov-fail-under=85
```

### Antes de Pull Request:
```bash
pytest -m "unit or integration" --cov=app --cov-fail-under=85
```

### Merge en main:
```bash
pytest --cov=app --cov-fail-under=85  # Incluye E2E
```

---

## 9. Criterios de Aceptación para Tests

Cada test debe cumplir:

- ✅ **Objetivo claro:** Nombre descriptivo, docstring explicativo
- ✅ **AAA Pattern:** Arrange, Act, Assert separados
- ✅ **Determinista:** Misma entrada = misma salida siempre
- ✅ **Independiente:** No depende de otros tests
- ✅ **Rápido:** Unit < 100ms, Integration < 1s
- ✅ **Aislado:** Sin BD / APIs reales (excepto integration tests)

---

## 10. Gobernanza de IA en Testing

**Política:**
- ✅ Generar fixtures, factories y test data con IA
- ✅ Generar tests básicos con IA (deben ser revisados)
- ❌ No aceptar tests generados sin modificación
- ✅ Refactorizar y optimizar código generado

**Validación:**
- Code review obligatorio para tests generados
- Verificar que test falla con código incorrecto
- Consolidar fixtures duplicadas

---

## 11. CI/CD Pipeline

### Pull Request:
1. ✅ Lint (Ruff, ESLint)
2. ✅ Unit + Integration tests (< 5 min)
3. ✅ Coverage report (≥ 85%)
4. ✅ Security scan

### Main branch:
1. ✅ Todos los tests anteriores
2. ✅ E2E tests
3. ✅ Cobertura completa
4. 🔶 Performance tests (opcional)

---

## 12. Documentación de Tests

- Cada módulo tiene `README_TEST.md` con ejemplos
- Commands documentados en `README.md` raíz
- Markers explicados en `pytest.ini` y `vitest.config.ts`

---

## 13. Próximos Pasos

1. ✅ Documentar estrategia (este archivo)
2. 🔲 Ampliar tests de módulos backend
3. 🔲 Agregar tests de frontend integration
4. 🔲 Configurar CI/CD GitHub Actions
5. 🔲 Implementar tests de seguridad
6. 🔲 Crear smoke tests post-deploy

---

**Última actualización:** 2026-03-05  
**Estado:** Activo
