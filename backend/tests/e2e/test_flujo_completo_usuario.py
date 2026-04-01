from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User


@pytest.mark.e2e
def test_flujo_registro_login_y_acceso(api_client: TestClient, db_session: Session) -> None:
    """Flujo E2E simplificado: crear roles, registrar usuario, login y acceder a /auth/me."""
    # Arrange: crear roles base y admin para alta de usuarios
    role_admin = Role(name="Administrador")
    role_student = Role(name="Estudiante")
    admin = User(
        email="admin@example.com",
        full_name="Administrador",
        hashed_password=hash_password("AdminPassword123"),
        is_active=True,
    )
    admin.roles = [role_admin]

    db_session.add_all([role_admin, role_student, admin])
    db_session.commit()

    admin_login = api_client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "AdminPassword123"},
    )
    assert admin_login.status_code == 200
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    # Registro de usuario (suponiendo endpoint /users)
    register_payload = {
        "email": "nuevo@ejemplo.com",
        "full_name": "Nuevo Estudiante",
        "password": "StudentPass123",
        "role_ids": [role_student.id],
    }
    reg_resp = api_client.post("/users", json=register_payload, headers=admin_headers)
    assert reg_resp.status_code in (201, 200)
    user_data = reg_resp.json()
    assert user_data["email"] == "nuevo@ejemplo.com"

    # Act: login
    login_resp = api_client.post(
        "/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert login_resp.status_code == 200

    # Act: acceder a /auth/me
    user_token = login_resp.json()["access_token"]
    me_resp = api_client.get("/auth/me", headers={"Authorization": f"Bearer {user_token}"})

    # Assert
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == register_payload["email"]
    assert "Estudiante" in me_data["roles"]

