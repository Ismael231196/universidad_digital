## Universidad Digital Backend

Backend profesional para gestión académica universitaria con FastAPI, SQLAlchemy y PostgreSQL.

### Arquitectura aplicada

- Clean Architecture por dominios.
- Separación estricta de responsabilidades: `models`, `schemas`, `services`, `routes`.
- Validaciones en Pydantic v2 y reglas de negocio en servicios.

### Estructura de carpetas

```
backend/
├── app/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── subjects/
│   ├── periods/
│   ├── enrollments/
│   ├── grades/
│   ├── core/
│   └── main.py
├── alembic/
├── alembic.ini
└── requirements.txt
```

### Seguridad implementada

- Hash de contraseñas con bcrypt.
- JWT firmado con expiración configurable.
- Cookies HttpOnly para el token de acceso.
- Dependencias de seguridad y verificación de roles.
- Manejo centralizado de errores y mensajes seguros.

### Flujo de autenticación

1. `POST /auth/login` con email y password.
2. Se retorna JWT y se setea cookie HttpOnly.
3. Rutas protegidas verifican token y roles.
4. `POST /auth/logout` revoca el token y elimina cookie.

### Roles y permisos

Roles base: `Administrador`, `Docente`, `Estudiante`.

- `Administrador`: acceso completo a CRUD y roles.
- `Docente`: acceso a listados y calificaciones.
- `Estudiante`: acceso a listados y creación de inscripciones.

### Variables de entorno (.env)

Copia `backend/.env.example` a `backend/.env` y rellena los valores. Las principales:

**Aplicación** (prefijo `APP_`):

```
APP_ENV=development
APP_DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/universidad
APP_JWT_SECRET=secreto_de_al_menos_32_caracteres
APP_JWT_EXPIRATION=60
APP_COOKIE_SECURE=false
APP_COOKIE_SAMESITE=lax
APP_CORS_ORIGINS=http://localhost:3000
```

**Email con Brevo SMTP** (sin prefijo `APP_`):

```
FRONTEND_URL=http://localhost:3000
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=tu_login@smtp-brevo.com
BREVO_SMTP_PASS=tu_contraseña_smtp
EMAIL_FROM=noreply@tudominio.com
```

> **Nota:** Brevo (antes Sendinblue) y SendGrid son proveedores distintos.
> Las credenciales no son intercambiables.
> Las variables `SENDGRID_API_KEY` y `SENDGRID_FROM_EMAIL` ya no se usan.

### Cómo levantar el backend

1. Crear base de datos PostgreSQL (solo la BD).
2. Instalar dependencias:

```
pip install -r requirements.txt
```

3. Ejecutar API:

```
uvicorn app.main:app --reload
```

### Migraciones básicas

Se incluye Alembic para versionar el esquema:

```
alembic revision --autogenerate -m "init"
alembic upgrade head
```

### Endpoints principales

- Auth: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- Users: `POST /users`, `GET /users`, `GET /users/{id}`, `PUT /users/{id}`, `DELETE /users/{id}`
- Roles: `POST /roles`, `GET /roles`, `GET /roles/{id}`, `PUT /roles/{id}`, `DELETE /roles/{id}`
- Subjects: `POST /subjects`, `GET /subjects`, `GET /subjects/{id}`, `PUT /subjects/{id}`, `DELETE /subjects/{id}`
- Periods: `POST /periods`, `GET /periods`, `GET /periods/{id}`, `PUT /periods/{id}`, `DELETE /periods/{id}`
- Enrollments: `POST /enrollments`, `GET /enrollments`, `GET /enrollments/{id}`, `PUT /enrollments/{id}`, `DELETE /enrollments/{id}`
- Grades: `POST /grades`, `GET /grades`, `GET /grades/{id}`, `PUT /grades/{id}`, `DELETE /grades/{id}`

### Próximos pasos

- Agregar tests unitarios y de integración.
- Documentar permisos por endpoint para frontend.
- Configurar CORS y ambientes (dev/prod).
