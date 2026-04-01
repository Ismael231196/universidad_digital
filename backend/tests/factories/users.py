from __future__ import annotations

import uuid
from app.core.security import hash_password
from app.users.models import User


def build_user_admin(email: str | None = None) -> User:
    """Factory para crear un usuario administrador."""
    if email is None:
        email = f"admin_{uuid.uuid4().hex[:8]}@example.com"
    return User(
        email=email,
        full_name="Administrador del Sistema",
        hashed_password=hash_password("AdminPassword123"),
        is_active=True,
    )


def build_user_student(email: str | None = None, is_active: bool = True) -> User:
    """Factory para crear un usuario estudiante.

    El campo `is_active` es personalizable para permitir pruebas de
    usuarios inactivos.
    """
    if email is None:
        email = f"student_{uuid.uuid4().hex[:8]}@example.com"
    return User(
        email=email,
        full_name="Estudiante de Prueba",
        hashed_password=hash_password("StudentPassword123"),
        is_active=is_active,
    )


def build_user_teacher(email: str | None = None) -> User:
    """Factory para crear un usuario profesor."""
    if email is None:
        email = f"teacher_{uuid.uuid4().hex[:8]}@example.com"
    return User(
        email=email,
        full_name="Docente de Prueba",
        hashed_password=hash_password("TeacherPassword123"),
        is_active=True,
    )

