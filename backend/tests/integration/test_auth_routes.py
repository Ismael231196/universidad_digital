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
def test_login_y_me_flujo_basico(api_client: TestClient, db_session: Session) -> None:
    # Arrange
    admin_role = Role(name="Administrador")
    user = User(
        email="admin@example.com",
        full_name="Administrador",
        hashed_password=hash_password("AdminPassword123"),
        is_active=True,
    )
    user.roles = [admin_role]
    db_session.add_all([admin_role, user])
    db_session.commit()

    payload = {"email": "admin@example.com", "password": "AdminPassword123"}

    # Act: login
    response = api_client.post("/auth/login", json=payload)

    # Assert login
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

    # Act: me
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    me_response = api_client.get("/auth/me", headers=headers)

    # Assert me
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "admin@example.com"
    assert "Administrador" in me_data["roles"]


@pytest.mark.integration
def test_login_con_credenciales_invalidas(api_client: TestClient) -> None:
    # Arrange
    payload = {"email": "wrong@example.com", "password": "badpass12"}

    # Act
    response = api_client.post("/auth/login", json=payload)

    # Assert
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.json()["detail"]


@pytest.mark.integration
def test_logout_revoca_token(api_client: TestClient, db_session: Session) -> None:
    # Arrange: crear usuario y login primero
    role = Role(name="Estudiante")
    user = User(
        email="student@example.com",
        full_name="Student",
        hashed_password=hash_password("StudentPass123"),
        is_active=True,
    )
    user.roles = [role]
    db_session.add_all([role, user])
    db_session.commit()

    headers = _login_headers(api_client, user.email, "StudentPass123")

    # Act: logout
    logout_resp = api_client.post("/auth/logout", headers=headers)

    # Assert
    assert logout_resp.status_code == 204

