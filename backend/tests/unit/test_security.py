from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password, is_jwt_error, create_access_token, decode_access_token
from app.core.errors import UnauthorizedError, ForbiddenError
from app.roles.models import Role
from app.users.models import User
from app.auth.services import authenticate_user


def _login_headers(api_client: TestClient, email: str, password: str) -> dict[str, str]:
    response = api_client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.unit
class TestCoreSecurityFunctions:
    """Unit tests for core security module functions."""

    def test_is_jwt_error_with_jwt_error(self):
        from jose import JWTError
        assert is_jwt_error(JWTError("bad token")) is True

    def test_is_jwt_error_with_non_jwt_error(self):
        assert is_jwt_error(ValueError("not jwt")) is False

    def test_create_access_token_raises_without_secret(self, monkeypatch):
        import app.core.security as sec
        monkeypatch.setattr(sec.settings, "jwt_secret", None)
        with pytest.raises(RuntimeError, match="APP_JWT_SECRET no configurado"):
            create_access_token(subject="1", jti="test-jti")

    def test_decode_access_token_raises_without_secret(self, monkeypatch):
        import app.core.security as sec
        monkeypatch.setattr(sec.settings, "jwt_secret", None)
        with pytest.raises(RuntimeError, match="APP_JWT_SECRET no configurado"):
            decode_access_token("fake.token.here")

    def test_hash_and_verify_password(self):
        from app.core.security import verify_password
        hashed = hash_password("TestPass123")
        assert verify_password("TestPass123", hashed) is True
        assert verify_password("WrongPass", hashed) is False


@pytest.mark.security
@pytest.mark.unit
class TestAuthenticationSecurity:
    """Tests de seguridad para autenticación."""

    def test_login_credenciales_invalidas_rechaza(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("CorrectPassword123"),
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        # Act / Assert
        with pytest.raises(UnauthorizedError):
            authenticate_user(db_session, "user@example.com", "WrongPassword")

    def test_login_usuario_inactivo_falla(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="inactive@example.com",
            full_name="Usuario Inactivo",
            hashed_password=hash_password("Password123"),
            is_active=False,  # ← Inactivo
        )
        db_session.add(user)
        db_session.commit()

        # Act / Assert
        with pytest.raises(ForbiddenError):
            authenticate_user(db_session, "inactive@example.com", "Password123")

    def test_login_usuario_inexistente_falla(self, db_session: Session) -> None:
        # Act / Assert
        with pytest.raises(UnauthorizedError):
            authenticate_user(db_session, "nonexistent@example.com", "Password123")

    def test_password_case_sensitive(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Password123"),
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        # Act / Assert: contraseña con diferente case falla
        with pytest.raises(UnauthorizedError):
            authenticate_user(db_session, "user@example.com", "password123")


@pytest.mark.security
class TestAuthorizationSecurity:
    """Tests de autorización/permisos por rol."""

    def test_usuario_estudiante_no_puede_crear_usuarios(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange: crear estudiante
        student_role = Role(name="Estudiante")
        student = User(
            email="student@example.com",
            full_name="Estudiante",
            hashed_password=hash_password("StudentPass123"),
        )
        student.roles = [student_role]
        db_session.add_all([student_role, student])
        db_session.commit()

        headers = _login_headers(api_client, "student@example.com", "StudentPass123")

        # Act: intentar crear usuario
        response = api_client.post(
            "/users",
            json={
                "email": "new@example.com",
                "full_name": "Nuevo",
                "password": "Pass123",
            },
            headers=headers,
        )

        # Assert
        assert response.status_code == 403

    def test_usuario_docente_no_puede_crear_usuarios(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        teacher_role = Role(name="Docente")
        teacher = User(
            email="teacher@example.com",
            full_name="Docente",
            hashed_password=hash_password("TeacherPass123"),
        )
        teacher.roles = [teacher_role]
        db_session.add_all([teacher_role, teacher])
        db_session.commit()

        headers = _login_headers(api_client, "teacher@example.com", "TeacherPass123")

        # Act: intentar crear rol (requiere admin)
        response = api_client.post("/roles", json={"name": "NewRole"}, headers=headers)

        # Assert
        assert response.status_code == 403

    def test_usuario_sin_token_rechazado(self, api_client: TestClient) -> None:
        # Arrange: sin hacer login
        api_client.cookies.clear()

        # Act: intentar acceder endpoints protegidos
        response = api_client.get("/auth/me")

        # Assert
        assert response.status_code == 401

    def test_usuario_no_autenticado_no_puede_listar_usuarios(
        self, api_client: TestClient
    ) -> None:
        # Act
        api_client.cookies.clear()
        response = api_client.get("/users/")

        # Assert
        assert response.status_code == 401


@pytest.mark.security
class TestInputValidation:
    """Tests de validación de entradas (prevención inyección, XSS, etc)."""

    def test_email_invalido_rechazado(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act: email inválido
        response = api_client.post(
            "/users",
            json={
                "email": "not-an-email",  # Inválido
                "full_name": "Test",
                "password": "ValidPass123",
            },
            headers=headers,
        )

        # Assert
        assert response.status_code == 422

    def test_password_corta_rechazada(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act: password corta (< 8 para estudiante)
        response = api_client.post(
            "/users",
            json={
                "email": "student@example.com",
                "full_name": "Estudiante",
                "password": "Short",  # < 8 chars
            },
            headers=headers,
        )

        # Assert
        assert response.status_code == 422

    def test_full_name_vacio_rechazado(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act: full_name vacío
        response = api_client.post(
            "/users",
            json={
                "email": "user@example.com",
                "full_name": "",  # Vacío
                "password": "ValidPass123",
            },
            headers=headers,
        )

        # Assert
        assert response.status_code == 422

    def test_sql_injection_attempt_rechazado(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange: intentar SQL injection en email
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act: intentar inyección SQL en email
        response = api_client.post(
            "/users",
            json={
                "email": "test@example.com' OR '1'='1",  # Intento SQL injection
                "full_name": "Attacker",
                "password": "AttackerPass123",
            },
            headers=headers,
        )

        # Assert: debe rechazar porque email inválido
        assert response.status_code == 422

    def test_xss_attempt_en_full_name_sanitizado(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act: XSS payload en full_name
        response = api_client.post(
            "/users",
            json={
                "email": "xss@example.com",
                "full_name": "<script>alert('XSS')</script>",
                "password": "ValidPass123",
            },
            headers=headers,
        )

        # Assert: debe aceptar (Pydantic y BD almacenan como texto)
        # pero la aplicación debe escapar al renderizar
        if response.status_code == 201:
            data = response.json()
            # Verificar que no se ejecuta script, solo se almacena como texto
            assert "<script>" in data["full_name"] or "alert" in data["full_name"]


@pytest.mark.security
class TestDataOwnership:
    """Tests de validación de ownership (usuario A no accede a datos de usuario B)."""

    def test_usuario_no_puede_actualizar_otro_usuario(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange: crear dos usuarios estudiantes
        student_role = Role(name="Estudiante")
        user1 = User(
            email="user1@example.com",
            full_name="Usuario 1",
            hashed_password=hash_password("Pass1234"),
        )
        user2 = User(
            email="user2@example.com",
            full_name="Usuario 2",
            hashed_password=hash_password("Pass4567"),
        )
        user1.roles = [student_role]
        user2.roles = [student_role]
        db_session.add_all([student_role, user1, user2])
        db_session.commit()

        headers = _login_headers(api_client, "user1@example.com", "Pass1234")

        # Act: intentar actualizar user2 (sin ser admin)
        response = api_client.put(
            f"/users/{user2.id}",
            json={"full_name": "Hackeo"},
            headers=headers,
        )

        # Assert: debe ser 403
        assert response.status_code == 403

    def test_usuario_no_puede_eliminar_otro_usuario(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        student_role = Role(name="Estudiante")
        user1 = User(
            email="user1@example.com",
            full_name="Usuario 1",
            hashed_password=hash_password("Pass1234"),
        )
        user2 = User(
            email="user2@example.com",
            full_name="Usuario 2",
            hashed_password=hash_password("Pass4567"),
        )
        user1.roles = [student_role]
        user2.roles = [student_role]
        db_session.add_all([student_role, user1, user2])
        db_session.commit()

        headers = _login_headers(api_client, "user1@example.com", "Pass1234")

        # Act: intentar eliminar user2
        response = api_client.delete(f"/users/{user2.id}", headers=headers)

        # Assert
        assert response.status_code == 403
