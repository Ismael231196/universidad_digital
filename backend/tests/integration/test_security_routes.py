from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User


@pytest.mark.security
@pytest.mark.integration
class TestAuthenticationRoutes:
    """Tests de integración para autenticación."""

    def test_login_exitoso_retorna_token(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        role = Role(name="Estudiante")
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Password123"),
            is_active=True,
        )
        user.roles = [role]
        db_session.add_all([role, user])
        db_session.commit()

        # Act
        response = api_client.post(
            "/auth/login",
            json={"email": "user@example.com", "password": "Password123"},
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert response.cookies.get("access_token") is not None

    def test_login_invalido_rechaza(self, api_client: TestClient) -> None:
        # Act
        response = api_client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "WrongPass"},
        )

        # Assert
        assert response.status_code == 401

    def test_logout_revoca_token(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange: login primero
        role = Role(name="Estudiante")
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Password123"),
        )
        user.roles = [role]
        db_session.add_all([role, user])
        db_session.commit()

        api_client.post(
            "/auth/login",
            json={"email": "user@example.com", "password": "Password123"},
        )

        # Act: logout
        response = api_client.post("/auth/logout")

        # Assert
        assert response.status_code == 204
        assert response.cookies.get("access_token") is None

    def test_me_endpoint_protegido(self, api_client: TestClient) -> None:
        # Act: sin token
        response = api_client.get("/auth/me")

        # Assert
        assert response.status_code == 401


@pytest.mark.security
@pytest.mark.integration
class TestAuthorizationRoutes:
    """Tests de autorización de endpoints."""

    def test_solo_admin_puede_crear_usuarios(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange: crear admin
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        # Login como admin
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        response = api_client.post(
            "/users",
            json={
                "email": "newuser@example.com",
                "full_name": "Nuevo",
                "password": "Pass123",
            },
        )

        # Assert
        assert response.status_code == 201

    def test_estudiante_no_puede_crear_usuarios(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        std_role = Role(name="Estudiante")
        std = User(
            email="student@example.com",
            full_name="Estudiante",
            hashed_password=hash_password("StudentPass123"),
        )
        std.roles = [std_role]
        db_session.add_all([std_role, std])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "student@example.com", "password": "StudentPass123"},
        )

        # Act
        response = api_client.post(
            "/users",
            json={
                "email": "another@example.com",
                "full_name": "Otro",
                "password": "Pass123",
            },
        )

        # Assert
        assert response.status_code == 403

    def test_solo_admin_puede_crear_roles(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange: admin
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        response = api_client.post(
            "/roles",
            json={"name": "Nuevo Rol"},
        )

        # Assert
        assert response.status_code == 201

    def test_docente_no_puede_crear_roles(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        teach_role = Role(name="Docente")
        teacher = User(
            email="teacher@example.com",
            full_name="Docente",
            hashed_password=hash_password("TeacherPass123"),
        )
        teacher.roles = [teach_role]
        db_session.add_all([teach_role, teacher])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "teacher@example.com", "password": "TeacherPass123"},
        )

        # Act
        response = api_client.post(
            "/roles",
            json={"name": "Nuevo Rol"},
        )

        # Assert
        assert response.status_code == 403

    def test_solo_admin_puede_listar_usuarios(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange: admin
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        response = api_client.get("/users")

        # Assert
        assert response.status_code == 200

    def test_estudiante_no_puede_listar_usuarios(
        self, api_client: TestClient, db_session: Session
    ) -> None:
        # Arrange
        std_role = Role(name="Estudiante")
        std = User(
            email="student@example.com",
            full_name="Estudiante",
            hashed_password=hash_password("StudentPass123"),
        )
        std.roles = [std_role]
        db_session.add_all([std_role, std])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "student@example.com", "password": "StudentPass123"},
        )

        # Act
        response = api_client.get("/users")

        # Assert
        assert response.status_code == 403


@pytest.mark.security
@pytest.mark.integration
class TestInputSanitization:
    """Tests de sanitización de entradas en endpoints."""

    def test_email_invalido_retorna_422(
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

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        response = api_client.post(
            "/users",
            json={
                "email": "invalid-email",
                "full_name": "Test",
                "password": "ValidPass123",
            },
        )

        # Assert
        assert response.status_code == 422

    def test_password_corta_retorna_422(
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

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act: password < 8 chars
        response = api_client.post(
            "/users",
            json={
                "email": "user@example.com",
                "full_name": "Usuario",
                "password": "Short",
            },
        )

        # Assert
        assert response.status_code == 422

    def test_campos_requeridos_validados(
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

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act: falta email
        response = api_client.post(
            "/users",
            json={
                "full_name": "Usuario",
                "password": "ValidPass123",
            },
        )

        # Assert
        assert response.status_code == 422


@pytest.mark.security
@pytest.mark.integration
class TestErrorMessagesNoExposeInfo:
    """Tests que errores no expongan información sensible."""

    def test_usuario_inexistente_no_revela_si_existe(
        self, api_client: TestClient
    ) -> None:
        # Act
        response = api_client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "SomePass"},
        )

        # Assert: debe ser 401, no revelar si email existe
        assert response.status_code == 401
        error = response.json()
        # El mensaje debe ser genérico
        assert "inválidas" in error["detail"].lower() or "invalid" in error["detail"].lower()

    def test_token_invalido_no_revela_detalles(
        self, api_client: TestClient
    ) -> None:
        # Arrange: enviar token inválido
        api_client.cookies.set("access_token", "invalid.token.here")

        # Act
        response = api_client.get("/auth/me")

        # Assert
        assert response.status_code == 401
        error = response.json()
        # No debe revelar estructura interna del token
        assert "decode" not in error["detail"].lower()
