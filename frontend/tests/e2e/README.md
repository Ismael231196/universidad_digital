Este directorio está pensado para pruebas End-to-End del frontend
usando una herramienta como Playwright o Cypress.

Ejemplos de flujos a cubrir:
- registro y login
- navegación por dashboard de estudiante/docente/admin
- matrícula en una materia
- visualización de notas

Las E2E no se ejecutan con Vitest sino con el runner propio
de la herramienta (por ejemplo `npx playwright test`).

