from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RoleFactoryData:
  name: str
  description: str | None = None


def build_role_admin() -> RoleFactoryData:
  return RoleFactoryData(
    name="Administrador",
    description="Administrador del sistema",
  )


def build_role_student() -> RoleFactoryData:
  return RoleFactoryData(
    name="Estudiante",
    description="Usuario estudiante",
  )


def build_role_teacher() -> RoleFactoryData:
  return RoleFactoryData(
    name="Docente",
    description="Usuario docente",
  )


def build_role_custom(name: str, description: str | None = None) -> RoleFactoryData:
  return RoleFactoryData(
    name=name,
    description=description,
  )
