from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class UserFactoryData:
  email: str
  full_name: str
  password: str
  role_ids: list[int] = field(default_factory=list)


def build_user_admin(email: str = "admin@example.com", role_ids: list[int] | None = None) -> UserFactoryData:
  return UserFactoryData(
    email=email,
    full_name="Administrador del Sistema",
    password="AdminPassword123",
    role_ids=role_ids or [],
  )


def build_user_student(email: str = "student@example.com", role_ids: list[int] | None = None) -> UserFactoryData:
  return UserFactoryData(
    email=email,
    full_name="Estudiante de Prueba",
    password="StudentPass123",
    role_ids=role_ids or [],
  )


def build_user_teacher(email: str = "teacher@example.com", role_ids: list[int] | None = None) -> UserFactoryData:
  return UserFactoryData(
    email=email,
    full_name="Docente de Prueba",
    password="TeacherPass123",
    role_ids=role_ids or [],
  )

