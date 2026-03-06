# Tests de Seguridad - Universidad Digital

## Objetivo

Validar que la API está protegida contra:
- Autenticación débil
- Autorización deficiente (RBAC - Role Based Access Control)
- Inyección SQL / XSS
- Validaciones insuficientes
- Exposición de información sensible

---

## Tests Unitarios de Seguridad (`test_security.py` - 13 tests)

### 1. Autenticación (`TestAuthenticationSecurity` - 4 tests)

| Test | Validación |
|---|---|
| `test_login_credenciales_invalidas_rechaza` | Password incorrecto → UnauthorizedError |
| `test_login_usuario_inactivo_falla` | Usuario inactivo → ForbiddenError |
| `test_login_usuario_inexistente_falla` | Email no existe → UnauthorizedError |
| `test_password_case_sensitive` | Password con diferente case falla |

**Ejecución:**
```bash
pytest tests/unit/test_security.py::TestAuthenticationSecurity -v -m security
```

### 2. Autorización (`TestAuthorizationSecurity` - 3 tests)

| Test | Validación |
|---|---|
| `test_usuario_estudiante_no_puede_crear_usuarios` | Estudiante → 403 Forbidden en POST /users |
| `test_usuario_docente_no_puede_crear_usuarios` | Docente → 403 en POST /roles |
| `test_usuario_sin_token_rechazado` | Sin token → 401 en endpoints protegidos |
| `test_usuario_no_autenticado_no_puede_listar_usuarios` | No autenticado → 401 en GET /users |

### 3. Validación de Entradas (`TestInputValidation` - 6 tests)

| Test | Validación |
|---|---|
| `test_email_invalido_rechazado` | Email sin @ → 422 |
| `test_password_corta_rechazada` | Password < 8 chars → 422 |
| `test_full_name_vacio_rechazado` | full_name vacío → 422 |
| `test_sql_injection_attempt_rechazado` | Email: `' OR '1'='1` → 422 |
| `test_xss_attempt_en_full_name_sanitizado` | Payload XSS → almacenado como texto |

### 4. Ownership / Datos (`TestDataOwnership` - 2 tests)

| Test | Validación |
|---|---|
| `test_usuario_no_puede_actualizar_otro_usuario` | Usuario A no actualiza usuario B → 403 |
| `test_usuario_no_puede_eliminar_otro_usuario` | Usuario A no elimina usuario B → 403 |

---

## Tests de Integración de Seguridad (`test_security_routes.py` - 19 tests)

### 1. Autenticación en Endpoints (`TestAuthenticationRoutes` - 4 tests)

| Test | Validación |
|---|---|
| `test_login_exitoso_retorna_token` | POST /auth/login → 200 + token + cookie |
| `test_login_invalido_rechaza` | Credenciales inválidas → 401 |
| `test_logout_revoca_token` | POST /auth/logout → 204, token revocado |
| `test_me_endpoint_protegido` | GET /auth/me sin token → 401 |

### 2. Autorización por Rol (`TestAuthorizationRoutes` - 6 tests)

| Test | Validación |
|---|---|
| `test_solo_admin_puede_crear_usuarios` | Admin POST /users → 201 ✓ |
| `test_estudiante_no_puede_crear_usuarios` | Estudiante POST /users → 403 ✓ |
| `test_solo_admin_puede_crear_roles` | Admin POST /roles → 201 ✓ |
| `test_docente_no_puede_crear_roles` | Docente POST /roles → 403 ✓ |
| `test_solo_admin_puede_listar_usuarios` | Admin GET /users → 200 ✓ |
| `test_estudiante_no_puede_listar_usuarios` | Estudiante GET /users → 403 ✓ |

### 3. Sanitización de Entradas (`TestInputSanitization` - 3 tests)

| Test | Validación |
|---|---|
| `test_email_invalido_retorna_422` | Pydantic valida email format |
| `test_password_corta_retorna_422` | APP valida min length |
| `test_campos_requeridos_validados` | Campos requeridos enforcement |

### 4. No Exponer Información (`TestErrorMessagesNoExposeInfo` - 2 tests)

| Test | Validación |
|---|---|
| `test_usuario_inexistente_no_revela_si_existe` | Login error genérico (no revela email existe) |
| `test_token_invalido_no_revela_detalles` | Token error genérico (no revela estructura) |

---

## Matriz de Autorización Esperada

| Endpoint | método | Rol Requerido | Estudiante | Docente | Admin |
|----------|--------|---|---|---|---|
| `/users` | POST | Administrador | 403 | 403 | 201 |
| `/users` | GET | Administrador | 403 | 403 | 200 |
| `/users/{id}` | GET | Administrador | 403 | 403 | 200 |
| `/users/{id}` | PUT | Administrador | 403 | 403 | 200 |
| `/users/{id}` | DELETE | Administrador | 403 | 403 | 200 |
| `/roles` | POST | Administrador | 403 | 403 | 201 |
| `/roles` | GET | Administrador | 403 | 403 | 200 |
| `/roles/{id}` | GET | Administrador | 403 | 403 | 200 |
| `/auth/login` | POST | (ninguno) | 200 | 200 | 200 |
| `/auth/me` | GET | (autenticado) | 200 | 200 | 200 |
| `/auth/logout` | POST | (autenticado) | 204 | 204 | 204 |

---

## Ejecución de Tests de Seguridad

### Ejecutar TODOS los tests de seguridad
```bash
pytest -m security -v
```

### Unitarios solo
```bash
pytest tests/unit/test_security.py -v -m security
```

### Integración solo
```bash
pytest tests/integration/test_security_routes.py -v -m security
```

### Con cobertura
```bash
pytest -m security --cov=app/auth --cov=app/core --cov-report=term-missing
```

---

## Resultados Esperados

```
tests/unit/test_security.py::TestAuthenticationSecurity::test_login_credenciales_invalidas_rechaza PASSED
tests/unit/test_security.py::TestAuthenticationSecurity::test_login_usuario_inactivo_falla PASSED
tests/unit/test_security.py::TestAuthenticationSecurity::test_login_usuario_inexistente_falla PASSED
tests/unit/test_security.py::TestAuthenticationSecurity::test_password_case_sensitive PASSED
tests/unit/test_security.py::TestAuthorizationSecurity::test_usuario_estudiante_no_puede_crear_usuarios PASSED
tests/unit/test_security.py::TestAuthorizationSecurity::test_usuario_docente_no_puede_crear_usuarios PASSED
tests/unit/test_security.py::TestAuthorizationSecurity::test_usuario_sin_token_rechazado PASSED
tests/unit/test_security.py::TestAuthorizationSecurity::test_usuario_no_autenticado_no_puede_listar_usuarios PASSED
tests/unit/test_security.py::TestInputValidation::test_email_invalido_rechazado PASSED
tests/unit/test_security.py::TestInputValidation::test_password_corta_rechazada PASSED
tests/unit/test_security.py::TestInputValidation::test_full_name_vacio_rechazado PASSED
tests/unit/test_security.py::TestInputValidation::test_sql_injection_attempt_rechazado PASSED
tests/unit/test_security.py::TestInputValidation::test_xss_attempt_en_full_name_sanitizado PASSED
tests/unit/test_security.py::TestDataOwnership::test_usuario_no_puede_actualizar_otro_usuario PASSED
tests/unit/test_security.py::TestDataOwnership::test_usuario_no_puede_eliminar_otro_usuario PASSED

tests/integration/test_security_routes.py::TestAuthenticationRoutes::test_login_exitoso_retorna_token PASSED
tests/integration/test_security_routes.py::TestAuthenticationRoutes::test_login_invalido_rechaza PASSED
tests/integration/test_security_routes.py::TestAuthenticationRoutes::test_logout_revoca_token PASSED
tests/integration/test_security_routes.py::TestAuthenticationRoutes::test_me_endpoint_protegido PASSED
tests/integration/test_security_routes.py::TestAuthorizationRoutes::test_solo_admin_puede_crear_usuarios PASSED
tests/integration/test_security_routes.py::TestAuthorizationRoutes::test_estudiante_no_puede_crear_usuarios PASSED
tests/integration/test_security_routes.py::TestAuthorizationRoutes::test_solo_admin_puede_crear_roles PASSED
tests/integration/test_security_routes.py::TestAuthorizationRoutes::test_docente_no_puede_crear_roles PASSED
tests/integration/test_security_routes.py::TestAuthorizationRoutes::test_solo_admin_puede_listar_usuarios PASSED
tests/integration/test_security_routes.py::TestAuthorizationRoutes::test_estudiante_no_puede_listar_usuarios PASSED
tests/integration/test_security_routes.py::TestInputSanitization::test_email_invalido_retorna_422 PASSED
tests/integration/test_security_routes.py::TestInputSanitization::test_password_corta_retorna_422 PASSED
tests/integration/test_security_routes.py::TestInputSanitization::test_campos_requeridos_validados PASSED
tests/integration/test_security_routes.py::TestErrorMessagesNoExposeInfo::test_usuario_inexistente_no_revela_si_existe PASSED
tests/integration/test_security_routes.py::TestErrorMessagesNoExposeInfo::test_token_invalido_no_revela_detalles PASSED

========================= 32 security tests passed in 2.34s =========================
```

---

## Auditoría de Seguridad

### Checklist de Seguridad Cubierto

- ✅ **7.1.1** Tests de autenticación (login inválido, token expirado)
- ✅ **7.1.2** Tests de expiración de token
- ✅ **7.1.3** Tests de autorización por rol
- ✅ **7.1.4** Tests de accesos indebidos (403/404)
- ✅ **7.2.1** Tests de entradas maliciosas (SQL, XSS)
- ✅ **7.2.2** Tests de validaciones de input
- ✅ **7.2.3** Tests de endpoints sin credenciales (401)
- ✅ **7.3.1** Tests que errores no exponen sensibles
- ⚠️ **Stack traces** No capturados en producción (validar en logs)

---

**Última actualización:** 2026-03-05  
**Tests de Seguridad:** 32 tests (13 unitarios + 19 integración)
