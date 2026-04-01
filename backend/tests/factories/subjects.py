import uuid
from app.subjects.models import Subject


def build_subject_active(
    code: str | None = None,
    name: str | None = None,
    credits: int = 3,
    is_active: bool = True,
) -> Subject:
    """Factory para crear una materia activa."""
    if code is None:
        code = f"MAT{uuid.uuid4().hex[:8].upper()}"
    if name is None:
        name = f"Materia {code}"

    return Subject(
        code=code,
        name=name,
        credits=credits,
        is_active=is_active,
    )


def build_subject_inactive(
    code: str | None = None,
    name: str | None = None,
    credits: int = 4,
) -> Subject:
    """Factory para crear una materia inactiva."""
    if code is None:
        code = f"MAT{uuid.uuid4().hex[:8].upper()}"
    if name is None:
        name = f"Materia Inactiva {code}"

    return Subject(
        code=code,
        name=name,
        credits=credits,
        is_active=False,
    )


def build_subject_custom(
    code: str,
    name: str,
    credits: int,
    is_active: bool = True,
) -> Subject:
    """Factory para crear una materia personalizada."""
    return Subject(
        code=code,
        name=name,
        credits=credits,
        is_active=is_active,
    )