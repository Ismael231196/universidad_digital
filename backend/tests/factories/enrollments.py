from __future__ import annotations

import uuid
from app.enrollments.models import Enrollment
from app.enrollments.schemas import EnrollmentCreate, EnrollmentUpdate


def build_enrollment_active(user_id: int | None = None, subject_id: int | None = None, period_id: int | None = None) -> Enrollment:
    """Factory para crear una inscripción activa."""
    # Use unique-ish IDs by default to avoid UniqueConstraint collisions in tests.
    if user_id is None:
        user_id = int(uuid.uuid4().int % 1000000) + 1000
    if subject_id is None:
        subject_id = int(uuid.uuid4().int % 1000000) + 1000
    if period_id is None:
        period_id = int(uuid.uuid4().int % 1000000) + 1000

    return Enrollment(
        user_id=user_id,
        subject_id=subject_id,
        period_id=period_id,
        is_active=True,
    )


def build_enrollment_inactive(user_id: int | None = None, subject_id: int | None = None, period_id: int | None = None) -> Enrollment:
    """Factory para crear una inscripción inactiva."""
    if user_id is None:
        user_id = int(uuid.uuid4().int % 1000000) + 1000
    if subject_id is None:
        subject_id = int(uuid.uuid4().int % 1000000) + 1000
    if period_id is None:
        period_id = int(uuid.uuid4().int % 1000000) + 1000

    return Enrollment(
        user_id=user_id,
        subject_id=subject_id,
        period_id=period_id,
        is_active=False,
    )


def build_enrollment_create(
    user_id: int = 1,
    subject_id: int = 1,
    period_id: int = 1,
) -> EnrollmentCreate:
    """Construye EnrollmentCreate con valores por defecto."""
    return EnrollmentCreate(
        user_id=user_id,
        subject_id=subject_id,
        period_id=period_id,
    )


def build_enrollment_update(
    is_active: bool | None = None,
) -> EnrollmentUpdate:
    """Construye EnrollmentUpdate con valores opcionales."""
    return EnrollmentUpdate(
        user_id=2,
        subject_id=2,
        period_id=1,
        is_active=is_active,
    )

def build_enrollment_custom(
    user_id: int,
    subject_id: int,
    period_id: int,
    is_active: bool = True,
) -> EnrollmentFactoryData:
    """Construye enrollment con valores personalizados."""
    return EnrollmentFactoryData(
        user_id=user_id,
        subject_id=subject_id,
        period_id=period_id,
        is_active=is_active,
    )