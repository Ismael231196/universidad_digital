from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.errors import ConflictError, NotFoundError
from app.enrollments.models import Enrollment
from app.grades.models import Grade
from app.grades.schemas import GradeCreate, GradeUpdate
from app.users.models import User


def _build_enrollment_label(enrollment: Enrollment | None) -> str | None:
    if not enrollment:
        return None
    parts: list[str] = [f"Inscripción #{enrollment.id}"]
    if enrollment.subject:
        subject = enrollment.subject.name
        if enrollment.subject.code:
            subject = f"{subject} ({enrollment.subject.code})"
        parts.append(subject)
    if enrollment.period:
        parts.append(enrollment.period.name)
    return " · ".join(parts)


def _enrich_grade(grade: Grade) -> Grade:
    enrollment = grade.enrollment
    if not enrollment:
        grade.enrollment_label = None
        grade.student_full_name = None
        grade.subject_name = None
        grade.subject_code = None
        grade.period_name = None
        grade.period_code = None
        return grade
    grade.enrollment_label = _build_enrollment_label(enrollment)
    grade.student_full_name = enrollment.user.full_name if enrollment.user else None
    grade.subject_name = enrollment.subject.name if enrollment.subject else None
    grade.subject_code = enrollment.subject.code if enrollment.subject else None
    grade.period_name = enrollment.period.name if enrollment.period else None
    grade.period_code = enrollment.period.code if enrollment.period else None
    return grade


def create_grade(db: Session, data: GradeCreate) -> Grade:
    """Registra una calificación."""
    enrollment = db.get(Enrollment, data.enrollment_id)
    if not enrollment:
        raise NotFoundError("Inscripción no encontrada.")
    if not enrollment.is_active:
        raise ConflictError("Inscripción inactiva.")
    # Validar que no exista ya una calificación para esta inscripción
    exists = db.scalar(
        select(Grade).where(Grade.enrollment_id == data.enrollment_id)
    )
    if exists:
        raise ConflictError("Ya existe una calificación para este estudiante y materia en este periodo.")
    grade = Grade(
        enrollment_id=data.enrollment_id,
        value=Decimal(str(data.value)),  # Convert float to Decimal
        notes=data.notes,
    )
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return _enrich_grade(grade)


def list_grades(db: Session, user: User) -> list[Grade]:
    """Lista calificaciones respetando ownership."""
    stmt = (
        select(Grade)
        .options(
            selectinload(Grade.enrollment).selectinload(Enrollment.user),
            selectinload(Grade.enrollment).selectinload(Enrollment.subject),
            selectinload(Grade.enrollment).selectinload(Enrollment.period),
        )
        .order_by(Grade.id)
    )
    if any(role.name == "Estudiante" for role in user.roles):
        stmt = stmt.join(Enrollment).where(Enrollment.user_id == user.id)
    return [_enrich_grade(grade) for grade in db.scalars(stmt).all()]


def get_grade(db: Session, grade_id: int, user: User) -> Grade:
    """Obtiene una calificación por ID respetando ownership."""
    grade = db.scalar(
        select(Grade)
        .options(
            selectinload(Grade.enrollment).selectinload(Enrollment.user),
            selectinload(Grade.enrollment).selectinload(Enrollment.subject),
            selectinload(Grade.enrollment).selectinload(Enrollment.period),
        )
        .where(Grade.id == grade_id)
    )
    if not grade:
        raise NotFoundError("Calificación no encontrada.")
    if any(role.name == "Estudiante" for role in user.roles):
        enrollment = db.get(Enrollment, grade.enrollment_id)
        if not enrollment or enrollment.user_id != user.id:
            raise ConflictError("Acceso no permitido.")
    return _enrich_grade(grade)


def update_grade(db: Session, grade_id: int, data: GradeUpdate, user: User) -> Grade:
    """Actualiza una calificación."""
    grade = get_grade(db, grade_id, user)
    if data.value is not None:
        grade.value = Decimal(str(data.value))  # Convert float to Decimal
    if data.notes is not None:
        grade.notes = data.notes
    db.commit()
    db.refresh(grade)
    return _enrich_grade(grade)


def delete_grade(db: Session, grade_id: int, user: User) -> None:
    """Elimina una calificación."""
    grade = get_grade(db, grade_id, user)
    db.delete(grade)
    db.commit()
