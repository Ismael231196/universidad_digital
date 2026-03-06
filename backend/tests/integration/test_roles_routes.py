from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User


@pytest.mark.integration
class TestRolesCreate:
    def test_crear_rol_como_admin(self, api_client: TestClient, db_session: Session) -> None:
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
        payload = {"name": "Nuevo Rol", "description": "Descripción del rol"}
        response = api_client.post("/roles", json=payload)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Nuevo Rol"
        assert data["description"] == "Descripción del rol"

    def test_crear_rol_sin_admin_falla(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        student_role = Role(name="Estudiante")
        user = User(
            email="student@example.com",
            full_name="Student",
            hashed_password=hash_password("StudentPass123"),
        )
        user.roles = [student_role]
        db_session.add_all([student_role, user])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "student@example.com", "password": "StudentPass123"},
        )

        # Act
        payload = {"name": "Nuevo Rol"}
        response = api_client.post("/roles", json=payload)

        # Assert
        assert response.status_code == 403


@pytest.mark.integration
class TestRolesRead:
    def test_listar_roles(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]

        role1 = Role(name="Rol 1")
        role2 = Role(name="Rol 2")
        db_session.add_all([admin_role, admin, role1, role2])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        response = api_client.get("/roles")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3

    def test_obtener_rol_por_id(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]

        target_role = Role(name="Docente", description="Rol docente")
        db_session.add_all([admin_role, admin, target_role])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        response = api_client.get(f"/roles/{target_role.id}")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Docente"


@pytest.mark.integration
class TestRolesUpdate:
    def test_actualizar_rol(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]

        target_role = Role(name="Rol Original")
        db_session.add_all([admin_role, admin, target_role])
        db_session.commit()

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        payload = {"name": "Rol Actualizado", "description": "Nueva descripción"}
        response = api_client.put(f"/roles/{target_role.id}", json=payload)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Rol Actualizado"
        assert data["description"] == "Nueva descripción"


@pytest.mark.integration
class TestRolesDelete:
    def test_eliminar_rol(self, api_client: TestClient, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        admin = User(
            email="admin@example.com",
            full_name="Admin",
            hashed_password=hash_password("AdminPassword123"),
        )
        admin.roles = [admin_role]

        target_role = Role(name="Rol a Eliminar")
        db_session.add_all([admin_role, admin, target_role])
        db_session.commit()
        role_id = target_role.id

        # Login
        api_client.post(
            "/auth/login",
            json={"email": "admin@example.com", "password": "AdminPassword123"},
        )

        # Act
        response = api_client.delete(f"/roles/{role_id}")

        # Assert
        assert response.status_code == 204

        # Verify deletion
        get_response = api_client.get(f"/roles/{role_id}")
        assert get_response.status_code == 404
