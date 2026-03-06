from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User


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
    assert "access_token" in response.cookies.get("access_token", "")

    # Act: me
    me_response = api_client.get("/auth/me")

    # Assert me
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "admin@example.com"
    assert any(role["name"] == "Administrador" for role in me_data["roles"])


@pytest.mark.integration
def test_login_con_credenciales_invalidas(api_client: TestClient) -> None:
    # Arrange
    payload = {"email": "wrong@example.com", "password": "badpass"}

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

    login_resp = api_client.post(
        "/auth/login", json={"email": user.email, "password": "StudentPass123"}
    )
    assert login_resp.status_code == 200

    # Act: logout
    logout_resp = api_client.post("/auth/logout")

    # Assert
    assert logout_resp.status_code == 204
    assert logout_resp.cookies.get("access_token") is None

