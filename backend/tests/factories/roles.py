from __future__ import annotations

import uuid
from dataclasses import dataclass


@dataclass
class RoleFactoryData:
  name: str
  description: str | None = None


def build_role_admin() -> RoleFactoryData:
  return RoleFactoryData(
    name=f"Administrador_{uuid.uuid4().hex[:4]}",
    description="Administrador del sistema",
  )


def build_role_student() -> RoleFactoryData:
  return RoleFactoryData(
    name=f"Estudiante_{uuid.uuid4().hex[:4]}",
    description="Usuario estudiante",
  )


def build_role_teacher() -> RoleFactoryData:
  return RoleFactoryData(
    name=f"Docente_{uuid.uuid4().hex[:4]}",
    description="Usuario docente",
  )


def build_role_custom(name: str, description: str | None = None) -> RoleFactoryData:
  return RoleFactoryData(
    name=name,
    description=description,
  )
