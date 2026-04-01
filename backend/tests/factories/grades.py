from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

from app.grades.schemas import GradeCreate, GradeUpdate


@dataclass
class GradeFactoryData:
    """Factory para datos de prueba de grades."""

    enrollment_id: int
    value: float
    notes: str | None = None
    created_at: datetime | None = None


def build_grade_create(
    enrollment_id: int = 1,
    value: float = 85.5,
    notes: str | None = None,
) -> GradeCreate:
    """Construye GradeCreate con valores por defecto."""
    return GradeCreate(
        enrollment_id=enrollment_id,
        value=value,
        notes=notes,
    )


def build_grade_update(
    value: float | None = None,
    notes: str | None = None,
) -> GradeUpdate:
    """Construye GradeUpdate con valores opcionales."""
    return GradeUpdate(value=value, notes=notes)


def build_grade_active() -> GradeFactoryData:
    """Construye grade activa."""
    return GradeFactoryData(
        enrollment_id=1,
        value=Decimal("90.00"),
        notes="Excelente desempeño",
    )


def build_grade_inactive() -> GradeFactoryData:
    """Construye grade inactiva (no aplicable para grades, pero para consistencia)."""
    return GradeFactoryData(
        enrollment_id=2,
        value=60.0,
        notes="Necesita mejorar",
    )


def build_grade_custom(
    enrollment_id: int,
    value: float,
    notes: str | None = None,
) -> GradeFactoryData:
    """Construye grade con valores personalizados."""
    return GradeFactoryData(
        enrollment_id=enrollment_id,
        value=value,
        notes=notes,
    )


# Legacy function for backward compatibility
from app.grades.models import Grade


def build_grade(
    enrollment_id: int = 1,
    value: float = 75.0,
    notes: str | None = None,
) -> Grade:
    """Factory to create a Grade instance (not persisted)."""
    return Grade(enrollment_id=enrollment_id, value=Decimal(str(value)), notes=notes)
