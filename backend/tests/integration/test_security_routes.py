from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User


def _login_headers(api_client: TestClient, email: str, password: str) -> dict[str, str]:
    response = api_client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.security
@pytest.mark.integration
class TestAuthenticationRoutes:
    """Tests de integracion para autenticacion."""

    def test_login_exitoso_retorna_token(self, api_client: TestClient, db_session: Session) -> None:
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

        response = api_client.post(
            "/auth/login",
            json={"email": "user@example.com", "password": "Password123"},
        )

        assert response.status_code == 200
        assert response.json().get("access_token") is not None

    def test_login_invalido_rechaza(self, api_client: TestClient) -> None:
        response = api_client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "WrongPass1"},
        )
        assert response.status_code == 401

    def test_logout_revoca_token(self, api_client: TestClient, db_session: Session) -> None:
        role = Role(name="Estudiante")
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Password123"),
        )
        user.roles = [role]
        db_session.add_all([role, user])
        db_session.commit()

        headers = _login_headers(api_client, "user@example.com", "Password123")
        response = api_client.post("/auth/logout", headers=headers)

        assert response.status_code == 204

    def test_me_endpoint_protegido(self, api_client: TestClient) -> None:
        response = api_client.get("/auth/me")
        assert response.status_code == 401


@pytest.mark.security
@pytest.mark.integration
class TestAuthorizationRoutes:
    """Tests de autorizacion de endpoints."""

    def test_solo_admin_puede_crear_usuarios(self, api_client: TestClient, db_session: Session) -> None:
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
        response = api_client.post(
            "/users",
            json={
                "email": "newuser@example.com",
                "full_name": "Nuevo",
                "password": "Pass12345",
            },
            headers=headers,
        )

        assert response.status_code == 201

    def test_estudiante_no_puede_crear_usuarios(self, api_client: TestClient, db_session: Session) -> None:
        std_role = Role(name="Estudiante")
        std = User(
            email="student@example.com",
            full_name="Estudiante",
            hashed_password=hash_password("StudentPass123"),
        )
        std.roles = [std_role]
        db_session.add_all([std_role, std])
        db_session.commit()

        headers = _login_headers(api_client, "student@example.com", "StudentPass123")
        response = api_client.post(
            "/users",
            json={
                "email": "another@example.com",
                "full_name": "Otro",
                "password": "Pass12345",
            },
            headers=headers,
        )

        assert response.status_code == 403

    def test_solo_admin_puede_crear_roles(self, api_client: TestClient, db_session: Session) -> None:
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
        response = api_client.post("/roles", json={"name": "Nuevo Rol"}, headers=headers)

        assert response.status_code == 201

    def test_docente_no_puede_crear_roles(self, api_client: TestClient, db_session: Session) -> None:
        teach_role = Role(name="Docente")
        teacher = User(
            email="teacher@example.com",
            full_name="Docente",
            hashed_password=hash_password("TeacherPass123"),
        )
        teacher.roles = [teach_role]
        db_session.add_all([teach_role, teacher])
        db_session.commit()

        headers = _login_headers(api_client, "teacher@example.com", "TeacherPass123")
        response = api_client.post("/roles", json={"name": "Nuevo Rol"}, headers=headers)

        assert response.status_code == 403

    def test_solo_admin_puede_listar_usuarios(self, api_client: TestClient, db_session: Session) -> None:
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
        response = api_client.get("/users", headers=headers)

        assert response.status_code == 200

    def test_estudiante_no_puede_listar_usuarios(self, api_client: TestClient, db_session: Session) -> None:
        std_role = Role(name="Estudiante")
        std = User(
            email="student@example.com",
            full_name="Estudiante",
            hashed_password=hash_password("StudentPass123"),
        )
        std.roles = [std_role]
        db_session.add_all([std_role, std])
        db_session.commit()

        headers = _login_headers(api_client, "student@example.com", "StudentPass123")
        response = api_client.get("/users", headers=headers)

        assert response.status_code == 403


@pytest.mark.security
@pytest.mark.integration
class TestInputSanitization:
    """Tests de sanitizacion de entradas en endpoints."""

    def test_email_invalido_retorna_422(self, api_client: TestClient, db_session: Session) -> None:
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
        response = api_client.post(
            "/users",
            json={
                "email": "invalid-email",
                "full_name": "Test",
                "password": "ValidPass123",
            },
            headers=headers,
        )

        assert response.status_code == 422

    def test_password_corta_retorna_422(self, api_client: TestClient, db_session: Session) -> None:
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
        response = api_client.post(
            "/users",
            json={
                "email": "user@example.com",
                "full_name": "Usuario",
                "password": "Short",
            },
            headers=headers,
        )

        assert response.status_code == 422

    def test_campos_requeridos_validados(self, api_client: TestClient, db_session: Session) -> None:
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
        response = api_client.post(
            "/users",
            json={"full_name": "Usuario", "password": "ValidPass123"},
            headers=headers,
        )

        assert response.status_code == 422


@pytest.mark.security
@pytest.mark.integration
class TestErrorMessagesNoExposeInfo:
    """Tests que errores no expongan informacion sensible."""

    def test_usuario_inexistente_no_revela_si_existe(self, api_client: TestClient) -> None:
        response = api_client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "SomePass1"},
        )

        assert response.status_code == 401
        error = response.json()
        assert "credencial" in error["detail"].lower() or "invalid" in error["detail"].lower()
