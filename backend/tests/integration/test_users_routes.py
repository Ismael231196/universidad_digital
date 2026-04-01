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


@pytest.mark.integration
class TestUsersCreate:
    def test_crear_usuario_como_admin(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange: crear admin
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
            is_active=True,
        )
        admin.roles = [admin_role]
        db_session.add_all([admin_role, admin])
        db_session.commit()

        # Login como admin
        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act: crear usuario
        payload = {
            "email": "newuser@example.com",
            "full_name": "Nuevo Usuario",
            "password": "ValidPassword123",
        }
        response = api_client.post("/users", json=payload, headers=headers)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "Nuevo Usuario"

    def test_crear_usuario_sin_admin_falla(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange: crear usuario normal
        student_role = Role(name="Estudiante")
        user = User(
            email="student@example.com",
            full_name="Student",
            hashed_password=hash_password("StudentPass123"),
            is_active=True,
        )
        user.roles = [student_role]
        db_session.add_all([student_role, user])
        db_session.commit()

        # Login
        headers = _login_headers(api_client, "student@example.com", "StudentPass123")

        # Act: intentar crear usuario
        payload = {
            "email": "another@example.com",
            "full_name": "Otro",
            "password": "Password123",
        }
        response = api_client.post("/users", json=payload, headers=headers)

        # Assert
        assert response.status_code == 403


@pytest.mark.integration
class TestUsersRead:
    def test_listar_usuarios_como_admin(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]

        user1 = User(
            email="user1@example.com",
            full_name="Usuario 1",
            hashed_password=hash_password("Pass123"),
        )
        user2 = User(
            email="user2@example.com",
            full_name="Usuario 2",
            hashed_password=hash_password("Pass123"),
        )
        db_session.add_all([admin_role, admin, user1, user2])
        db_session.commit()

        # Login
        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act
        response = api_client.get("/users", headers=headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3

    def test_obtener_usuario_por_id(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]

        target_user = User(
            email="user@example.com",
            full_name="User Target",
            hashed_password=hash_password("Pass123"),
        )
        db_session.add_all([admin_role, admin, target_user])
        db_session.commit()

        # Login
        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act
        response = api_client.get(f"/users/{target_user.id}", headers=headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "user@example.com"


@pytest.mark.integration
class TestUsersUpdate:
    def test_actualizar_usuario(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]

        target_user = User(
            email="user@example.com",
            full_name="Nombre Original",
            hashed_password=hash_password("Pass123"),
        )
        db_session.add_all([admin_role, admin, target_user])
        db_session.commit()

        # Login
        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act
        payload = {"full_name": "Nombre Actualizado"}
        response = api_client.put(f"/users/{target_user.id}", json=payload, headers=headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Nombre Actualizado"


@pytest.mark.integration
class TestUsersDelete:
    def test_desactivar_usuario(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
            is_active=True,
        )
        admin.roles = [admin_role]

        target_user = User(
            email="user@example.com",
            full_name="User",
            hashed_password=hash_password("Pass123"),
            is_active=True,
        )
        db_session.add_all([admin_role, admin, target_user])
        db_session.commit()

        # Login
        headers = _login_headers(api_client, "admin@example.com", "AdminPassword123")

        # Act
        response = api_client.delete(f"/users/{target_user.id}", headers=headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False
