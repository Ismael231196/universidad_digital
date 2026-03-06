from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.roles.models import Role


@pytest.mark.e2e
def test_flujo_registro_login_y_acceso(api_client: TestClient, db_session: Session) -> None:
    """Flujo E2E simplificado: crear roles, registrar usuario, login y acceder a /auth/me."""
    # Arrange: crear rol estudiante por defecto
    role_student = Role(name="Estudiante")
    db_session.add(role_student)
    db_session.commit()

    # Registro de usuario (suponiendo endpoint /users)
    register_payload = {
        "email": "nuevo@ejemplo.com",
        "full_name": "Nuevo Estudiante",
        "password": "StudentPass123",
        "role_ids": [role_student.id],
    }
    reg_resp = api_client.post("/users", json=register_payload)
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
    me_resp = api_client.get("/auth/me")

    # Assert
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == register_payload["email"]
    assert any(role["name"] == "Estudiante" for role in me_data["roles"])

