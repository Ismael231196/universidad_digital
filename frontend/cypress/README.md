# Cypress en Frontend

## Estructura
- `cypress/e2e/auth.cy.ts`: pruebas E2E estables con `intercept` (mock backend).
- `cypress/e2e/auth-hardening.cy.ts`: robustez de autenticación (logout, 500, redirecciones por rol).
- `cypress/e2e/rbac-navigation.cy.ts`: permisos por rol y navegación protegida.
- `cypress/e2e/crud-admin.cy.ts`: pruebas E2E CRUD de admin con backend simulado (users, subjects, periods, enrollments).
- `cypress/e2e/grades-crud.cy.ts`: CRUD de calificaciones para admin/docente y validaciones.
- `cypress/e2e/real-backend.cy.ts`: pruebas E2E reales contra backend levantado.
- `cypress/support/e2e.ts`: soporte global para Cypress.

## Requisitos para pruebas reales
1. Backend corriendo en `http://127.0.0.1:8000`.
2. Frontend corriendo en `http://localhost:3000`.
3. Usuarios existentes en base de datos:
- Admin: `admin@example.com` / `AdminPassword123`
- Docente: `teacher@example.com` / `TeacherPassword123`
- Estudiante: `student@example.com` / `StudentPassword123`

Tambien puedes pasar credenciales por variables de Cypress:
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `TEACHER_EMAIL`, `TEACHER_PASSWORD`
- `STUDENT_EMAIL`, `STUDENT_PASSWORD`

## Comandos
- Abrir UI de Cypress: `npm run cypress:open`
- Ejecutar todas las specs: `npm run cypress:run`
- Ejecutar CRUD admin (usa `http://localhost:3001`): `npm run cypress:run:crud`
- Ejecutar RBAC/navegación: `npm run cypress:run:rbac`
- Ejecutar CRUD de calificaciones: `npm run cypress:run:grades`
- Ejecutar hardening auth: `npm run cypress:run:hardening`
- Ejecutar pack profesional (auth + hardening + rbac + crud + grades): `npm run cypress:run:pro`
- Ejecutar solo pruebas reales: `npm run cypress:run:real`

## Ejemplo con variables por terminal (PowerShell)
```powershell
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="AdminPassword123"
$env:TEACHER_EMAIL="teacher@example.com"
$env:TEACHER_PASSWORD="TeacherPassword123"
$env:STUDENT_EMAIL="student@example.com"
$env:STUDENT_PASSWORD="StudentPassword123"
npm run cypress:run:real
```
