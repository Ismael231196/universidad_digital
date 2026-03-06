# Enterprise Testing Audit Checklist
## Evaluación integral de calidad de sistemas de pruebas

**Proyecto:** Sistema Universidad Digital  
**Alcance:** Frontend (React/Vitest) + Backend (FastAPI/pytest)  
**Objetivo:** Evaluar la madurez del sistema de testing desde arquitectura, confiabilidad, seguridad, operación y mantenibilidad.

---

## Cómo usar este checklist

- **Cumple (✓):** El ítem está implementado y documentado.
- **Parcial (◐):** Existe pero no está formalizado o es inconsistente.
- **No cumple (✗):** No aplica o no está implementado.
- **N/A:** No aplica al contexto del proyecto.

Al final de cada sección se puede calcular un **% de cumplimiento** para priorizar mejoras.

---

## 1. Estrategia global de testing

### 1.1 Definición estratégica

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 1.1.1 | Existe estrategia de testing documentada | ☐ | `docs/` o README con enfoque unit/integration/e2e |
| 1.1.2 | Se define claramente qué nivel de test valida cada tipo de riesgo | ☐ | Documento que mapea unit → lógica; integration → API/BD; e2e → flujos |
| 1.1.3 | El sistema sigue Test Pyramid / Test Trophy | ☐ | Más tests unitarios que integration; menos E2E que integration |
| 1.1.4 | Se evita dependencia excesiva de pruebas E2E | ☐ | E2E solo para flujos críticos; no como reemplazo de unit/integration |
| 1.1.5 | Existe mapeo test → requisito → riesgo | ☐ | Tests nombrados o agrupados por feature/requisito; markers o tags por riesgo |

**Cumplimiento sección 1.1:** _____ / 5 (_____ %)

### 1.2 Gestión de riesgo

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 1.2.1 | Los flujos críticos del negocio están identificados | ☐ | Lista de flujos: login, matrícula, pagos, notas, reportes, administración |
| 1.2.2 | Existe priorización de pruebas por impacto de negocio | ☐ | Tests marcados (ej. `@pytest.mark.security`, `critical`) o documentación de prioridad |
| 1.2.3 | Se prueban rutas de mayor impacto económico o reputacional | ☐ | Auth, pagos, matrículas, emisión de certificados/notas cubiertos |
| 1.2.4 | Se identifican componentes críticos del sistema | ☐ | Auth, servicios de usuarios, enrollments, grades, API pública |
| 1.2.5 | Los tests reflejan el modelo de riesgo del sistema | ☐ | Cobertura y casos de seguridad alineados con componentes críticos |

**Cumplimiento sección 1.2:** _____ / 5 (_____ %)

---

## 2. Calidad de diseño de casos de prueba

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 2.1 | Cada test tiene objetivo claro | ☐ | Nombre del test o docstring describe qué se valida y por qué |
| 2.2 | El test valida un comportamiento observable | ☐ | Assertions sobre salida/estado/efectos visibles; no detalles de implementación |
| 2.3 | Existe separación clara entre Arrange, Act, Assert | ☐ | Bloques comentados o estructura visual (línea en blanco) en los tests |
| 2.4 | Se prueban rutas felices (caso exitoso esperado) | ☐ | Al menos un test por flujo que verifica el resultado correcto |
| 2.5 | Se prueban rutas alternas y errores | ☐ | Casos de fallo: validación, no encontrado, conflicto, no autorizado |
| 2.6 | Se prueban límites (boundaries) | ☐ | Valores en el borde: 0, máximo, mínimo, listas vacías, longitud exacta |
| 2.7 | Se prueban entradas vacías, nulas, fuera de rango e inválidas | ☐ | Tests con `""`, `null`/`None`, números negativos, tipos incorrectos, formatos inválidos |
| 2.8 | Los tests no contienen lógica compleja | ☐ | Sin condicionales/bucles elaborados; datos y expectativas explícitos |
| 2.9 | Los tests no dependen de implementación interna | ☐ | Tests por contrato/API pública; sin acceder a privados ni detalles de clase |

**Cumplimiento sección 2:** _____ / 9 (_____ %)

---

## 3. Arquitectura del sistema de pruebas

### 3.1 Organización

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 3.1.1 | Estructura clara de tests (unit / integration / component / contract / e2e / performance) | ☐ | `tests/` con subcarpetas definidas; opcional: component, contract, performance según stack |
| 3.1.2 | No hay tests mezclados con código de producción | ☐ | Tests solo en `tests/` o carpetas dedicadas; ningún `test_*.py` dentro de `src/` o `app/` |
| 3.1.3 | Los módulos de test reflejan el dominio del sistema | ☐ | test_usuarios, test_auth, test_matriculas, etc.; alineados con módulos de negocio |
| 3.1.4 | No existen archivos de test excesivamente grandes | ☐ | Archivos acotados (ej. &lt; 300–400 líneas); lógica repetida en fixtures/factories |

**Cumplimiento sección 3.1:** _____ / 4 (_____ %)

### 3.2 Independencia

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 3.2.1 | Los tests son deterministas | ☐ | Misma entrada → misma salida; sin reloj real ni datos aleatorios no sembrados |
| 3.2.2 | Los tests no dependen del orden de ejecución | ☐ | Cualquier orden da el mismo resultado; no asumir que otro test corrió antes |
| 3.2.3 | Cada test prepara su propio estado | ☐ | Arrange explícito; fixtures que crean datos necesarios; no depender de estado global |
| 3.2.4 | No existen dependencias implícitas entre tests | ☐ | Un test no requiere que otro haya creado datos; aislamiento por test o por clase |
| 3.2.5 | Se utilizan factories o fixtures en archivos diferentes | ☐ | `conftest.py`, `factories/`, `fixtures/`; reutilización sin duplicar datos en cada test |

**Cumplimiento sección 3.2:** _____ / 5 (_____ %)

**Cumplimiento sección 3 (total):** _____ / 9 (_____ %)

---

## 4. Pruebas unitarias (dominio y lógica)

### 4.1 Cobertura de dominio

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 4.1.1 | Se cubren reglas de negocio críticas | ☐ | Tests en servicios/dominio: validaciones, cálculos, reglas de matrícula, pagos, notas |
| 4.1.2 | Se cubren condiciones de error | ☐ | Casos que provocan error (datos inválidos, no encontrado, conflicto) |
| 4.1.3 | Se cubren excepciones esperadas | ☐ | Assert sobre excepciones concretas (UnauthorizedError, NotFoundError, etc.) |
| 4.1.4 | Se prueban ramificaciones lógicas | ☐ | Cobertura de if/else, switch; distintos caminos del código |
| 4.1.5 | Se prueban invariantes del dominio | ☐ | Reglas que siempre deben cumplirse (ej. nota entre 0 y 5, email único) |
| 4.1.6 | Se prueban transiciones de estado | ☐ | Cambios de estado (pendiente → pagado, activo → inactivo, etc.) |

**Cumplimiento sección 4.1:** _____ / 6 (_____ %)

### 4.2 Aislamiento

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 4.2.1 | Dependencias externas están mockeadas | ☐ | BD, APIs, servicios externos sustituidos por mocks/stubs en tests unitarios |
| 4.2.2 | No se usa base de datos real | ☐ | Unit tests sin conexión a PostgreSQL/MySQL; uso de mocks o objetos en memoria |
| 4.2.3 | No se realizan llamadas HTTP reales | ☐ | Clientes HTTP mockeados (vi.mock, unittest.mock, respuestas fixture) |
| 4.2.4 | No se accede al sistema de archivos | ☐ | Lectura/escritura de archivos mockeada o uso de sistema temporal en memoria |

**Cumplimiento sección 4.2:** _____ / 4 (_____ %)

**Cumplimiento sección 4 (total):** _____ / 10 (_____ %)

---

## 5. Pruebas de integración

### 5.1 Cobertura de integración

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 5.1.1 | Se prueban integraciones entre servicios | ☐ | Tests que ejercitan servicio A + servicio B (ej. auth + users, enrollments + grades) |
| 5.1.2 | Se prueba comunicación con base de datos | ☐ | Consultas reales contra BD de prueba; INSERT/UPDATE/SELECT verificados |
| 5.1.3 | Se prueban repositorios y persistencia | ☐ | Tests de capa de datos: guardar, recuperar, actualizar, listar con filtros |
| 5.1.4 | Se prueban serialización/deserialización | ☐ | Request/response de API, esquemas Pydantic, JSON; formatos esperados |
| 5.1.5 | Se prueban errores de dependencias externas | ☐ | BD caída, timeout, respuesta inválida; manejo de fallos de integración |

**Cumplimiento sección 5.1:** _____ / 5 (_____ %)

### 5.2 Infraestructura

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 5.2.1 | Se usan bases de datos de prueba | ☐ | SQLite en disco/memoria, PostgreSQL en Docker, o equivalente aislado de producción |
| 5.2.2 | Se usan contenedores o entornos aislados | ☐ | Docker Compose para tests, venv/entorno dedicado; no compartir con dev/prod |
| 5.2.3 | El estado se reinicia entre tests | ☐ | Rollback por test, BD recreada por suite, o transacciones que no hacen commit |

**Cumplimiento sección 5.2:** _____ / 3 (_____ %)

**Cumplimiento sección 5 (total):** _____ / 8 (_____ %)

---

## 6. Contract Testing (API)

### 6.1 Contrato API

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 6.1.1 | Existen pruebas de contrato API | ☐ | Tests que validan acuerdo consumidor–proveedor (OpenAPI, Pact, esquemas) |
| 6.1.2 | Se valida schema de request | ☐ | Campos obligatorios, tipos, formatos; rechazo de payload inválido |
| 6.1.3 | Se valida schema de response | ☐ | Estructura y tipos de la respuesta; ej. Pydantic, JSON Schema en respuestas |
| 6.1.4 | Se validan códigos HTTP | ☐ | 200, 201, 400, 401, 403, 404, 422, 500 según contrato del endpoint |
| 6.1.5 | Se prueban errores de validación | ☐ | 422 con detalle de errores; mensajes esperados para request inválido |

**Cumplimiento sección 6.1:** _____ / 5 (_____ %)

### 6.2 Compatibilidad

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 6.2.1 | Se detectan breaking changes | ☐ | Tests de contrato fallan si cambia schema/códigos; CI o herramienta de contrato |
| 6.2.2 | Existe versionado de contratos | ☐ | OpenAPI con versión, v1/v2 en path o header; documentación de cambios |
| 6.2.3 | Se prueban integraciones entre servicios | ☐ | Consumer/provider o cliente–API; contratos compartidos o publicados |

**Cumplimiento sección 6.2:** _____ / 3 (_____ %)

**Cumplimiento sección 6 (total):** _____ / 8 (_____ %)

---

## 7. Seguridad de aplicación

### 7.1 Autenticación y autorización

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 7.1.1 | Se prueban mecanismos de autenticación | ☐ | Login con credenciales válidas/inválidas, cookie/token, logout |
| 7.1.2 | Se prueban expiraciones de token | ☐ | Token expirado rechazado; refresh o mensaje claro de sesión caducada |
| 7.1.3 | Se prueban autorizaciones por rol | ☐ | Acceso permitido/denegado según rol (Administrador, Docente, Estudiante) |
| 7.1.4 | Se prueban accesos indebidos | ☐ | Usuario A no accede a recurso de B; 403/404 en rutas no permitidas |

**Cumplimiento sección 7.1:** _____ / 4 (_____ %)

### 7.2 Seguridad de entrada

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 7.2.1 | Se prueban entradas maliciosas básicas | ☐ | SQL injection, XSS, payloads largos, caracteres especiales en campos |
| 7.2.2 | Se prueban validaciones de input | ☐ | Tipos, longitudes, formatos (email, números); rechazo con 422/400 |
| 7.2.3 | Se prueban endpoints sin credenciales | ☐ | Llamadas sin token/cookie devuelven 401; no información sensible en respuesta |

**Cumplimiento sección 7.2:** _____ / 3 (_____ %)

### 7.3 Seguridad de salida

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 7.3.1 | No se exponen errores sensibles | ☐ | Respuestas de error genéricas en producción; sin rutas internas ni detalles de BD |
| 7.3.2 | No se filtran stack traces | ☐ | Stack traces no aparecen en respuesta al cliente; solo en logs del servidor |

**Cumplimiento sección 7.3:** _____ / 2 (_____ %)

**Cumplimiento sección 7 (total):** _____ / 9 (_____ %)

---

## 8. Performance y escalabilidad

### 8.1 Cobertura de performance

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 8.1.1 | Se miden tiempos de respuesta de endpoints críticos | ☐ | Locust, k6, Artillery o similar; métricas por endpoint (auth, listados, etc.) |
| 8.1.2 | Se definen umbrales de performance | ☐ | SLA o SLO documentados (ej. p95 &lt; 500 ms); tests que fallan si se superan |
| 8.1.3 | Se prueban escenarios de carga nominal | ☐ | Carga esperada en producción; usuarios concurrentes típicos |
| 8.1.4 | Se prueban escenarios de estrés | ☐ | Carga por encima de lo nominal; punto de quiebre o degradación |
| 8.1.5 | Se detectan regresiones de rendimiento | ☐ | Benchmarks en CI; comparación con baseline; alertas en degradación |

**Cumplimiento sección 8.1:** _____ / 5 (_____ %)

### 8.2 Métricas

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 8.2.1 | Se reportan percentiles (p50, p95, p99) | ☐ | Latencia por percentil; reportes de carga o dashboards con p50/p95/p99 |

**Cumplimiento sección 8.2:** _____ / 1 (_____ %)

**Cumplimiento sección 8 (total):** _____ / 6 (_____ %)

---

## 9. Resiliencia y tolerancia a fallos

### 9.1 Fallos y degradación

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 9.1.1 | Se prueban fallos de red | ☐ | Simulación de desconexión, conexión rechazada; comportamiento esperado (retry, fallback, error controlado) |
| 9.1.2 | Se prueban timeouts | ☐ | Respuestas lentas o sin respuesta; timeout configurado y manejo (error, retry, cancelación) |
| 9.1.3 | Se prueban reintentos | ☐ | Política de reintentos; backoff; éxito tras fallo temporal |
| 9.1.4 | Se prueban degradaciones parciales | ☐ | Un servicio caído mientras otros siguen; modo degradado o circuit breaker |

**Cumplimiento sección 9.1:** _____ / 4 (_____ %)

### 9.2 Recuperación

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 9.2.1 | Se valida manejo seguro de errores | ☐ | Excepciones capturadas; respuestas controladas; sin crashes ni información sensible expuesta |
| 9.2.2 | Se prueban fallos de dependencias externas | ☐ | BD, APIs externas, colas; mock de fallos; comportamiento ante 5xx, timeout, indisponibilidad |
| 9.2.3 | Se prueba recuperación del sistema | ☐ | Tras fallo, el sistema vuelve a estado operativo; health checks; reinicio de conexiones |

**Cumplimiento sección 9.2:** _____ / 3 (_____ %)

**Cumplimiento sección 9 (total):** _____ / 7 (_____ %)

---

## 10. Datos de prueba

### 10.1 Calidad de datos

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 10.1.1 | Se utilizan fixtures reutilizables | ☐ | `conftest.py`, factories; datos compartidos entre tests sin duplicar |
| 10.1.2 | Los datos de prueba son deterministas | ☐ | Misma entrada → mismo resultado; seeds fijos; sin `random()` sin sembrar |
| 10.1.3 | No se usan datos persistentes no controlados | ☐ | Sin BD de desarrollo/producción; solo BD de test o mocks |
| 10.1.4 | Se limpian datos entre pruebas | ☐ | Rollback, truncate, BD en memoria por test; estado aislado |
| 10.1.5 | Se usan datos sintéticos | ☐ | Faker, factories, datos generados; no datos reales de usuarios/producción |

**Cumplimiento sección 10.1:** _____ / 5 (_____ %)

### 10.2 Control de datasets

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 10.2.1 | Los datasets críticos están versionados | ☐ | JSON, SQL, YAML en repo; cambios trazables; `tests/data/` en control de versiones |
| 10.2.2 | Se documenta la estructura de datos de prueba | ☐ | README, esquemas, o comentarios que describen campos y relaciones |

**Cumplimiento sección 10.2:** _____ / 2 (_____ %)

**Cumplimiento sección 10 (total):** _____ / 7 (_____ %)

---

## 11. Confiabilidad y determinismo

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 11.1 | Tests deterministas (misma entrada → misma salida) | ☐ | Sin reloj real en assertions; seeds fijos donde aplique |
| 11.2 | Independencia entre tests (no orden de ejecución, no estado compartido) | ☐ | Cada test puede correr aislado; fixtures que limpian estado |
| 11.3 | Uso de AAA (Arrange-Act-Assert) de forma explícita o consistente | ☐ | Comentarios o estructura clara en tests representativos |
| 11.4 | Datos de prueba reproducibles (factories, seeds, sin hardcodeo disperso) | ☐ | Factories en `tests/factories/`, datos en `tests/data/` |
| 11.5 | Manejo explícito de flaky (timeouts, reintentos o exclusión documentada) | ☐ | Tests lentos marcados; E2E con timeouts adecuados |

**Cumplimiento sección 11:** _____ / 5 (_____ %)

---

## 12. Observabilidad de pruebas

### 12.1 Logs y evidencia

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 12.1.1 | Los fallos generan logs útiles | ☐ | Mensajes claros, stack trace, contexto (request, estado); sin logs vacíos o genéricos |
| 12.1.2 | Los fallos generan evidencia (screenshots/videos) | ☐ | Playwright/Cypress screenshots en E2E; videos de sesión; artifacts en CI |
| 12.1.3 | Se registran tiempos de ejecución | ☐ | Duración por test o suite; reporte de lentitud; identificación de tests lentos |
| 12.1.4 | Se monitorea tasa de flaky tests | ☐ | Tests que fallan intermitentemente identificados; métricas o reportes; plan de corrección |

**Cumplimiento sección 12.1:** _____ / 4 (_____ %)

### 12.2 Diagnóstico

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 12.2.1 | Un fallo en CI puede reproducirse localmente | ☐ | Mismo comando, mismo entorno; documentación de cómo reproducir; sin dependencias ocultas |
| 12.2.2 | Existe historial de resultados de pruebas | ☐ | Resultados por commit/PR; tendencia de fallos; dashboard o reportes históricos |

**Cumplimiento sección 12.2:** _____ / 2 (_____ %)

**Cumplimiento sección 12 (total):** _____ / 6 (_____ %)

---

## 13. Mantenibilidad del sistema de tests

### 13.1 Claridad y reutilización

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 13.1.1 | Los nombres de tests son claros | ☐ | Describen escenario y resultado esperado; convención consistente (test_X_cuando_Y_devuelve_Z) |
| 13.1.2 | No existe duplicación excesiva | ☐ | Lógica repetida extraída a fixtures, helpers o parametrización; DRY aplicado |
| 13.1.3 | Se usan helpers reutilizables | ☐ | Funciones de utilidad, custom assertions, wrappers; compartidos entre tests |
| 13.1.4 | Se utilizan page objects en E2E | ☐ | Patrón Page Object para selectores y acciones; encapsulación de la UI en E2E |

**Cumplimiento sección 13.1:** _____ / 4 (_____ %)

### 13.2 Escalabilidad

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 13.2.1 | Se pueden agregar tests sin romper otros | ☐ | Nuevos tests aislados; fixtures que no colisionan; estructura que soporta crecimiento |
| 13.2.2 | El sistema de pruebas escala con el proyecto | ☐ | Tiempo de suite acotado; paralelización si aplica; organización que evita deuda técnica |

**Cumplimiento sección 13.2:** _____ / 2 (_____ %)

**Cumplimiento sección 13 (total):** _____ / 6 (_____ %)

---

## 14. Cobertura inteligente

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 14.1 | Las rutas críticas están cubiertas | ☐ | Tests que validan flujos de autenticación, matrícula, calificaciones, reportes |
| 14.2 | Las reglas de negocio están cubiertas | ☐ | Validaciones de dominio: cálculo de notas, restricciones de matrícula, cambios de estado |
| 14.3 | Los errores importantes están cubiertos | ☐ | Excepciones esperadas: autenticación fallida, autorización denegada, validación, conflictos |
| 14.4 | Las integraciones críticas están cubiertas | ☐ | Tests de integración para BD, APIs internas, servicios de terceros |

**Calidad de cobertura**

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 14.5 | No se infló cobertura con tests triviales | ☐ | Tests con assertions significativas; no solo llamadas sin validar resultado |
| 14.6 | Se revisa cobertura por módulo | ☐ | Desglose por componente/servicio: auth 90%, users 85%, enrollments 88%, etc. |

**Cumplimiento sección 14:** _____ / 6 (_____ %)

---

## 15. Gobernanza de IA en testing

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 15.1 | Existe política de uso de IA | ☐ | Documento que define qué puede generarse con IA (tests, fixtures) y qué no |
| 15.2 | Los tests generados por IA son revisados | ☐ | Code review obligatorio; validación de lógica y cobertura |
| 15.3 | Se refactoriza código generado | ☐ | No se acepta IA verbatim; se mejora, optimiza y se alinea con estándares del proyecto |
| 15.4 | Se eliminan redundancias generadas por IA | ☐ | Tests duplicados consolidados; fixtures reutilizadas; DRY aplicado |
| 15.5 | Se valida que los tests realmente fallen cuando corresponde | ☐ | Verificación manual de que test falla con código incorrecto (mutation testing opcional) |

**Cumplimiento sección 15:** _____ / 5 (_____ %)

---

## 16. Release readiness

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 16.1 | Todas las suites críticas pasan | ☐ | Unit, integration, security tests sin fallos; smoke tests verdes |
| 16.2 | No hay defectos bloqueantes | ☐ | Registro de defectos; críticos y bloqueantes resueltos; histórico de resolución |
| 16.3 | Existe plan de rollback | ☐ | Documento: paso a paso para revertir release; validación de reversión |
| 16.4 | Existe monitoreo post-deploy | ☐ | Alertas configuradas (errores, rendimiento, disponibilidad); dashboard observable |
| 16.5 | Existe smoke test post-release | ☐ | Suite corta que valida funcionalidad crítica tras despliegue; automatizado o checklist |

**Cumplimiento sección 16:** _____ / 5 (_____ %)

---

## 17. CI/CD y quality gates

### 17.1 Pipeline y quality gates

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 17.1.1 | Pipeline ejecuta lint | ☐ | Ruff, flake8, eslint, etc. en job de CI; fallo si hay errores |
| 17.1.2 | Pipeline ejecuta tests | ☐ | pytest, vitest, jest; job de test en cada push/PR |
| 17.1.3 | Pipeline ejecuta coverage | ☐ | Reporte de cobertura generado; umbral configurado |
| 17.1.4 | Pipeline ejecuta security scan | ☐ | SAST, dependencias (npm audit, pip-audit, Snyk, etc.); vulnerabilidades reportadas |
| 17.1.5 | El pipeline falla si fallan tests | ☐ | Job de test con exit code; bloqueo de merge si tests fallan |
| 17.1.6 | Existe quality gate mínimo | ☐ | Cobertura ≥ X%, lint sin errores, sin vulnerabilidades críticas; gates documentados |
| 17.1.7 | Se publican reportes de cobertura | ☐ | Artifact, Codecov, Coveralls, o similar; visible en PR o dashboard |

**Cumplimiento sección 17.1:** _____ / 7 (_____ %)

### 17.2 Estrategia de ejecución

| # | Criterio | Cumple | Evidencia / Ubicación |
|---|----------|--------|------------------------|
| 17.2.1 | Tests rápidos en Pull Request | ☐ | Solo unit + integration rápidos; E2E excluido o paralelo; tiempo acotado (ej. &lt; 5 min) |
| 17.2.2 | Tests completos en main | ☐ | Suite completa tras merge; E2E, performance opcional; validación pre-release |
| 17.2.3 | Smoke tests post-deploy | ☐ | Tests básicos tras despliegue; health checks, endpoints críticos; rollback si fallan |

**Cumplimiento sección 17.2:** _____ / 3 (_____ %)

**Cumplimiento sección 17 (total):** _____ / 10 (_____ %)

---

## Resumen ejecutivo

| Área | Total ítems | Cumplidos | % |
|------|-------------|-----------|---|
| 1. Estrategia global | 10 | | |
| 2. Calidad de diseño de casos de prueba | 9 | | |
| 3. Arquitectura del sistema de pruebas | 9 | | |
| 4. Pruebas unitarias (dominio y lógica) | 10 | | |
| 5. Pruebas de integración | 8 | | |
| 6. Contract Testing (API) | 8 | | |
| 7. Seguridad de aplicación | 9 | | |
| 8. Performance y escalabilidad | 6 | | |
| 9. Resiliencia y tolerancia a fallos | 7 | | |
| 10. Datos de prueba | 7 | | |
| 11. Confiabilidad | 5 | | |
| 12. Observabilidad de pruebas | 6 | | |
| 13. Mantenibilidad del sistema de tests | 6 | | |
| 14. Cobertura inteligente | 6 | | |
| 15. Gobernanza de IA en testing | 5 | | |
| 16. Release readiness | 5 | | |
| 17. CI/CD y quality gates | 10 | | |
| **TOTAL** | **126** | | |

---

## Sistema de evaluación

### Escala de calificación

| Score | Nivel |
|-------|-------|
| 95–100 | Nivel ingeniería de calidad avanzada |
| 90–94 | Excelente |
| 80–89 | Bueno |
| 70–79 | Aceptable |
| 60–69 | Académico |
| < 60 | Riesgo alto |

### Recomendación de evaluación

Para cada ítem usar:

- **✅ Cumple** = 1 punto
- **⚠️ Evidencia insuficiente** = 0.5 puntos
- **❌ No cumple** = 0 puntos

**Cálculo del score:**
1. Llenar cada ítem con ✅, ⚠️ o ❌
2. Sumar puntos según la tabla anterior
3. Dividir puntos totales entre ítems totales × 100 = % final
4. Ubicar % en la escala de calificación

**Nivel de madurez sugerido:**

- **≥ 90%:** Madurez alta; mantener y documentar excepciones.
- **70–89%:** Madurez media; plan de mejora en ítems no cumplidos.
- **50–69%:** Madurez baja; priorizar estrategia, riesgo y CI.
- **< 50%:** Crítico; definir estrategia de testing y flujos críticos primero.

---

## Referencia rápida: ubicación de artefactos en Universidad Digital

| Artefacto | Frontend | Backend |
|-----------|----------|---------|
| Config tests | `frontend/vitest.config.ts` | `backend/pytest.ini` |
| Cobertura | `frontend/vitest.config.ts` (coverage) | `backend/.coveragerc` |
| Unit tests | `frontend/tests/unit/` | `backend/tests/unit/` |
| Integration | `frontend/tests/integration/` | `backend/tests/integration/` |
| E2E | `frontend/tests/e2e/` (Playwright recomendado) | `backend/tests/e2e/` |
| Fixtures | `frontend/tests/setupTests.ts`, componentes | `backend/tests/fixtures/conftest.py` |
| Factories | Componentes/helpers en tests | `backend/tests/factories/` |
| Comandos | `npm test`, `npm run coverage` | `pytest`, `pytest -m unit`, etc. |

*Documento vivo: actualizar evidencia y fechas al completar auditorías.*
