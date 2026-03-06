from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from fastapi import Request
from sqlalchemy.orm import Session

from app.auth.models import RevokedToken
from app.auth.services import (
    authenticate_user,
    create_token_for_user,
    extract_token_data,
    get_current_user,
    get_token_from_request,
    is_token_revoked,
    require_roles,
)
from app.core.errors import ForbiddenError, NotFoundError, UnauthorizedError
from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User


@pytest.mark.unit
def test_authenticate_user_valido(db_session: Session) -> None:
    # Arrange
    user = User(
        email="user@example.com",
        full_name="Usuario",
        hashed_password=hash_password("Passw0rd!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    # Act
    result = authenticate_user(db_session, "user@example.com", "Passw0rd!")

    # Assert
    assert result.id == user.id


@pytest.mark.unit
def test_authenticate_user_credenciales_invalidas(db_session: Session) -> None:
    # Arrange
    user = User(
        email="user@example.com",
        full_name="Usuario",
        hashed_password=hash_password("Passw0rd!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    # Act / Assert
    with pytest.raises(UnauthorizedError):
        authenticate_user(db_session, "user@example.com", "incorrecta")


@pytest.mark.unit
def test_authenticate_user_usuario_inactivo(db_session: Session) -> None:
    # Arrange
    user = User(
        email="user@example.com",
        full_name="Usuario",
        hashed_password=hash_password("Passw0rd!"),
        is_active=False,
    )
    db_session.add(user)
    db_session.commit()

    # Act / Assert
    with pytest.raises(ForbiddenError):
        authenticate_user(db_session, "user@example.com", "Passw0rd!")


@pytest.mark.unit
def test_create_token_for_user_y_extract_token_data(db_session: Session) -> None:
    # Arrange
    user = User(
        email="user@example.com",
        full_name="Usuario",
        hashed_password=hash_password("Passw0rd!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    # Act
    token, jti, exp = create_token_for_user(user)
    jti2, exp2 = extract_token_data(token)

    # Assert
    assert isinstance(token, str)
    assert isinstance(jti, str)
    assert jti == jti2
    assert isinstance(exp, datetime)
    assert isinstance(exp2, datetime)
    assert exp2 >= datetime.now(timezone.utc)


@pytest.mark.unit
def test_revoke_and_is_token_revoked(db_session: Session) -> None:
    # Arrange
    jti = "test-jti"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    revoked = RevokedToken(jti=jti, expires_at=expires_at)
    db_session.add(revoked)
    db_session.commit()

    # Act
    revoked_flag = is_token_revoked(db_session, jti)

    # Assert
    assert revoked_flag is True


class DummyScope(dict):
    """Scope mínima para Request en tests unitarios."""


@pytest.mark.unit
def test_get_token_from_request_header() -> None:
    # Arrange
    scope = DummyScope({"type": "http", "headers": []})
    request = Request(scope)
    request.headers.__dict__["_list"] = [(b"authorization", b"Bearer 123")]

    # Act
    token = get_token_from_request(request)

    # Assert
    assert token == "123"


@pytest.mark.unit
def test_get_current_user_token_revocado(db_session: Session) -> None:
    # Arrange
    user = User(
        email="user@example.com",
        full_name="Usuario",
        hashed_password=hash_password("Passw0rd!"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token, jti, exp = create_token_for_user(user)
    db_session.add(RevokedToken(jti=jti, expires_at=exp))
    db_session.commit()

    scope = DummyScope({"type": "http", "headers": []})
    request = Request(scope)
    request.headers.__dict__["_list"] = [(b"authorization", f"Bearer {token}".encode())]

    # Act / Assert
    with pytest.raises(UnauthorizedError):
        get_current_user(db_session, request)


@pytest.mark.unit
def test_require_roles_ok() -> None:
    # Arrange
    role_admin = Role(id=1, name="Administrador")
    user = User(
        email="admin@example.com",
        full_name="Admin",
        hashed_password="x",
        is_active=True,
    )
    user.roles = [role_admin]

    # Act / Assert
    require_roles(user, {"Administrador"})


@pytest.mark.unit
def test_require_roles_forbidden() -> None:
    # Arrange
    role_student = Role(id=2, name="Estudiante")
    user = User(
        email="student@example.com",
        full_name="Student",
        hashed_password="x",
        is_active=True,
    )
    user.roles = [role_student]

    # Act / Assert
    with pytest.raises(ForbiddenError):
        require_roles(user, {"Administrador"})

