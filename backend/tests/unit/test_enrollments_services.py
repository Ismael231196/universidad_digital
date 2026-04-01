import uuid
import pytest

from app.core.errors import ConflictError, NotFoundError
from app.enrollments.models import Enrollment
from app.roles.models import Role
from app.enrollments.services import (
    create_enrollment,
    deactivate_enrollment,
    get_enrollment,
    list_enrollments,
    update_enrollment,
)

from ..factories.enrollments import (
    build_enrollment_create,
    build_enrollment_update,
)
from ..factories.periods import build_period_active
from ..factories.subjects import build_subject_active
from ..factories.users import build_user_student


@pytest.fixture(autouse=True)
def cleanup_enrollment_data(db_session):
    """Aisla datos entre tests unitarios de enrollments."""
    from app.grades.models import Grade
    from app.periods.models import AcademicPeriod
    from app.roles.models import UserRole
    from app.subjects.models import Subject
    from app.users.models import User

    db_session.query(Grade).delete()
    db_session.query(Enrollment).delete()
    db_session.query(UserRole).delete()
    db_session.query(User).delete()
    db_session.query(Role).delete()
    db_session.query(Subject).delete()
    db_session.query(AcademicPeriod).delete()
    db_session.commit()

    yield

    # Evita autoflush de objetos pendientes creados durante el test.
    db_session.rollback()

    db_session.query(Grade).delete()
    db_session.query(Enrollment).delete()
    db_session.query(UserRole).delete()
    db_session.query(User).delete()
    db_session.query(Role).delete()
    db_session.query(Subject).delete()
    db_session.query(AcademicPeriod).delete()
    db_session.commit()


def _get_or_create_role(db_session, name: str) -> Role:
    role = db_session.query(Role).filter(Role.name == name).first()
    if not role:
        role = Role(name=name)
        db_session.add(role)
        db_session.commit()
    return role


class TestCreateEnrollment:
    """Pruebas unitarias para create_enrollment."""

    def test_create_enrollment_success(self, db_session):
        """Debe crear enrollment exitosamente."""
        # Arrange
        user = build_user_student()
        user.roles = [_get_or_create_role(db_session, "Estudiante")]
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([user, subject, period])
        db_session.commit()

        data = build_enrollment_create(user_id=user.id, subject_id=subject.id, period_id=period.id)

        # Act
        result = create_enrollment(db_session, data, user)

        # Assert
        assert result.user_id == user.id
        assert result.subject_id == subject.id
        assert result.period_id == period.id
        assert result.is_active is True

    def test_create_enrollment_student_ownership(self, db_session):
        """Estudiante solo puede inscribirse a sí mismo."""
        # Arrange
        student = build_user_student()
        student.roles = [_get_or_create_role(db_session, "Estudiante")]
        other_user = build_user_student(email=f"other_{uuid.uuid4().hex[:8]}@example.com")
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([student, other_user, subject, period])
        db_session.commit()

        data = build_enrollment_create(user_id=other_user.id, subject_id=subject.id, period_id=period.id)

        # Act & Assert
        with pytest.raises(ConflictError, match="Acceso no permitido"):
            create_enrollment(db_session, data, student)

    def test_create_enrollment_user_not_found(self, db_session):
        """Debe fallar si usuario no existe."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        data = build_enrollment_create(user_id=999, subject_id=1, period_id=1)

        # Act & Assert
        with pytest.raises(NotFoundError, match="Usuario no encontrado"):
            create_enrollment(db_session, data, admin)

    def test_create_enrollment_inactive_user(self, db_session):
        """Debe fallar si usuario está inactivo."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        inactive_user = build_user_student(is_active=False)
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([inactive_user, subject, period])
        db_session.commit()

        data = build_enrollment_create(user_id=inactive_user.id, subject_id=subject.id, period_id=period.id)

        # Act & Assert
        with pytest.raises(ConflictError, match="Usuario inactivo"):
            create_enrollment(db_session, data, admin)

    def test_create_enrollment_subject_not_found(self, db_session):
        """Debe fallar si materia no existe."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        db_session.add(user)
        db_session.commit()

        data = build_enrollment_create(user_id=user.id, subject_id=999, period_id=1)

        # Act & Assert
        with pytest.raises(NotFoundError, match="Materia no encontrada"):
            create_enrollment(db_session, data, admin)

    def test_create_enrollment_inactive_subject(self, db_session):
        """Debe fallar si materia está inactiva."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        inactive_subject = build_subject_active(is_active=False)
        period = build_period_active()
        db_session.add_all([user, inactive_subject, period])
        db_session.commit()

        data = build_enrollment_create(user_id=user.id, subject_id=inactive_subject.id, period_id=period.id)

        # Act & Assert
        with pytest.raises(ConflictError, match="Materia inactiva"):
            create_enrollment(db_session, data, admin)

    def test_create_enrollment_period_not_found(self, db_session):
        """Debe fallar si periodo no existe."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        subject = build_subject_active()
        db_session.add_all([user, subject])
        db_session.commit()

        data = build_enrollment_create(user_id=user.id, subject_id=subject.id, period_id=999)

        # Act & Assert
        with pytest.raises(NotFoundError, match="Periodo académico no encontrado"):
            create_enrollment(db_session, data, admin)

    def test_create_enrollment_inactive_period(self, db_session):
        """Debe fallar si periodo está inactivo."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        subject = build_subject_active()
        inactive_period = build_period_active(is_active=False)
        db_session.add_all([user, subject, inactive_period])
        db_session.commit()

        data = build_enrollment_create(user_id=user.id, subject_id=subject.id, period_id=inactive_period.id)

        # Act & Assert
        with pytest.raises(ConflictError, match="Periodo académico inactivo"):
            create_enrollment(db_session, data, admin)

    def test_create_enrollment_duplicate(self, db_session):
        """Debe fallar si enrollment ya existe."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([user, subject, period])
        db_session.commit()

        existing_enrollment = Enrollment(
            user_id=user.id,
            subject_id=subject.id,
            period_id=period.id,
        )
        db_session.add(existing_enrollment)
        db_session.commit()

        data = build_enrollment_create(user_id=user.id, subject_id=subject.id, period_id=period.id)

        # Act & Assert
        with pytest.raises(ConflictError, match="La inscripción ya existe"):
            create_enrollment(db_session, data, admin)


class TestListEnrollments:
    """Pruebas unitarias para list_enrollments."""

    def test_list_enrollments_admin_sees_all(self, db_session):
        """Admin debe ver todas las enrollments."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user1 = build_user_student()
        user2 = build_user_student(email="user2@example.com")
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([user1, user2, subject, period])
        db_session.commit()

        enrollment1 = Enrollment(user_id=user1.id, subject_id=subject.id, period_id=period.id)
        enrollment2 = Enrollment(user_id=user2.id, subject_id=subject.id, period_id=period.id)
        db_session.add_all([enrollment1, enrollment2])
        db_session.commit()

        # Act
        result = list_enrollments(db_session, admin)

        # Assert
        assert len(result) == 2
        assert result[0].user_id in [user1.id, user2.id]
        assert result[1].user_id in [user1.id, user2.id]

    def test_list_enrollments_student_sees_own(self, db_session):
        """Estudiante solo ve sus propias enrollments."""
        # Arrange
        student = build_user_student()
        student.roles = [_get_or_create_role(db_session, "Estudiante")]
        other_user = build_user_student(email=f"other_{uuid.uuid4().hex[:8]}@example.com")
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([student, other_user, subject, period])
        db_session.commit()

        student_enrollment = Enrollment(user_id=student.id, subject_id=subject.id, period_id=period.id)
        other_enrollment = Enrollment(user_id=other_user.id, subject_id=subject.id, period_id=period.id)
        db_session.add_all([student_enrollment, other_enrollment])
        db_session.commit()

        # Act
        result = list_enrollments(db_session, student)

        # Assert
        assert len(result) == 1
        assert result[0].user_id == student.id

    def test_list_enrollments_empty(self, db_session):
        """Debe retornar lista vacía si no hay enrollments."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]

        # Act
        result = list_enrollments(db_session, admin)

        # Assert
        assert result == []


class TestGetEnrollment:
    """Pruebas unitarias para get_enrollment."""

    def test_get_enrollment_success(self, db_session):
        """Debe retornar enrollment existente."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([user, subject, period])
        db_session.commit()

        enrollment = Enrollment(user_id=user.id, subject_id=subject.id, period_id=period.id)
        db_session.add(enrollment)
        db_session.commit()

        # Act
        result = get_enrollment(db_session, enrollment.id, admin)

        # Assert
        assert result.id == enrollment.id
        assert result.user_id == user.id

    def test_get_enrollment_not_found(self, db_session):
        """Debe fallar si enrollment no existe."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]

        # Act & Assert
        with pytest.raises(NotFoundError, match="Inscripción no encontrada"):
            get_enrollment(db_session, 999, admin)

    def test_get_enrollment_student_ownership(self, db_session):
        """Estudiante no puede acceder a enrollment de otro."""
        # Arrange
        student = build_user_student()
        student.roles = [_get_or_create_role(db_session, "Estudiante")]
        other_user = build_user_student(email=f"other_{uuid.uuid4().hex[:8]}@example.com")
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([student, other_user, subject, period])
        db_session.commit()

        other_enrollment = Enrollment(user_id=other_user.id, subject_id=subject.id, period_id=period.id)
        db_session.add(other_enrollment)
        db_session.commit()

        # Act & Assert
        with pytest.raises(ConflictError, match="Acceso no permitido"):
            get_enrollment(db_session, other_enrollment.id, student)


class TestUpdateEnrollment:
    """Pruebas unitarias para update_enrollment."""

    def test_update_enrollment_is_active(self, db_session):
        """Debe actualizar is_active."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([user, subject, period])
        db_session.commit()

        enrollment = Enrollment(user_id=user.id, subject_id=subject.id, period_id=period.id, is_active=True)
        db_session.add(enrollment)
        db_session.commit()

        data = build_enrollment_update(is_active=False)

        # Act
        result = update_enrollment(db_session, enrollment.id, data, admin)

        # Assert
        assert result.is_active is False

    def test_update_enrollment_no_changes(self, db_session):
        """Debe funcionar con data vacía."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([user, subject, period])
        db_session.commit()

        enrollment = Enrollment(user_id=user.id, subject_id=subject.id, period_id=period.id)
        db_session.add(enrollment)
        db_session.commit()

        data = build_enrollment_update()

        # Act
        result = update_enrollment(db_session, enrollment.id, data, admin)

        # Assert
        assert result.id == enrollment.id


class TestDeactivateEnrollment:
    """Pruebas unitarias para deactivate_enrollment."""

    def test_deactivate_enrollment_success(self, db_session):
        """Debe desactivar enrollment."""
        # Arrange
        admin = build_user_student()
        admin.roles = [_get_or_create_role(db_session, "Administrador")]
        user = build_user_student()
        subject = build_subject_active()
        period = build_period_active()
        db_session.add_all([user, subject, period])
        db_session.commit()

        enrollment = Enrollment(user_id=user.id, subject_id=subject.id, period_id=period.id, is_active=True)
        db_session.add(enrollment)
        db_session.commit()

        # Act
        result = deactivate_enrollment(db_session, enrollment.id, admin)

        # Assert
        assert result.is_active is False