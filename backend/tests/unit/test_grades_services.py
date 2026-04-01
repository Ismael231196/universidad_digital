import pytest
from decimal import Decimal

from app.core.errors import ConflictError, NotFoundError
from app.grades.services import create_grade, delete_grade, get_grade, list_grades, update_grade
from app.users.models import User
from tests.factories.enrollments import build_enrollment_active
from tests.factories.grades import build_grade_create, build_grade_update
from tests.factories.users import build_user_admin, build_user_student, build_user_teacher


@pytest.fixture(autouse=True)
def cleanup_grades(db_session):
    """Clean up grades before each test and ensure base entities exist."""
    import uuid
    from app.grades.models import Grade
    from app.subjects.models import Subject
    from app.periods.models import AcademicPeriod
    from app.roles.models import Role
    from datetime import date, timedelta
    
    # Clean up before test
    db_session.query(Grade).delete()
    db_session.query(Role).delete()
    db_session.query(AcademicPeriod).delete()
    db_session.query(Subject).delete()
    db_session.commit()
    
    # Ensure base entities exist for tests with unique codes
    unique_id = uuid.uuid4().hex[:4]
    subject = Subject(code=f"TEST{unique_id}", name="Test Subject", credits=3, is_active=True)
    period = AcademicPeriod(
        code=f"2024-1-{unique_id}",
        name="Test Period",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=120),
        is_active=True
    )
    db_session.add_all([subject, period])
    db_session.commit()
    
    yield
    
    # Clean up after test - handle session state gracefully
    try:
        db_session.query(Grade).delete()
        db_session.query(Role).delete()
        db_session.query(AcademicPeriod).delete()
        db_session.query(Subject).delete()
        db_session.commit()
    except Exception:
        # If session is in bad state, rollback and continue
        # The main db_session fixture will handle final cleanup
        try:
            db_session.rollback()
        except Exception:
            pass


class TestGradesServices:
    """Pruebas unitarias para servicios de grades."""

    class TestCreateGrade:
        """Pruebas para create_grade."""

        def test_create_grade_success(self, db_session):
            """Crear grade exitosamente."""
            # Setup
            enrollment = build_enrollment_active()
            db_session.add(enrollment)
            db_session.commit()

            data = build_grade_create(enrollment_id=enrollment.id, value=95.0)
            user = build_user_admin()

            # Execute
            result = create_grade(db_session, data)

            # Assert
            assert result.enrollment_id == enrollment.id
            assert result.value == Decimal("95.00")
            assert result.notes is None

        def test_create_grade_enrollment_not_found(self, db_session):
            """Fallar si enrollment no existe."""
            data = build_grade_create(enrollment_id=999)
            user = build_user_admin()

            with pytest.raises(NotFoundError, match="Inscripción no encontrada"):
                create_grade(db_session, data)

        def test_create_grade_inactive_enrollment(self, db_session):
            """Fallar si enrollment está inactiva."""
            enrollment = build_enrollment_active()
            enrollment.is_active = False
            db_session.add(enrollment)
            db_session.commit()

            data = build_grade_create(enrollment_id=enrollment.id)
            user = build_user_admin()

            with pytest.raises(ConflictError, match="Inscripción inactiva"):
                create_grade(db_session, data)

    class TestListGrades:
        """Pruebas para list_grades."""

        def test_list_grades_admin(self, db_session):
            """Admin ve todas las grades."""
            # Setup
            enrollment1 = build_enrollment_active()
            enrollment2 = build_enrollment_active()
            db_session.add_all([enrollment1, enrollment2])
            db_session.commit()

            grade1 = build_grade_create(enrollment_id=enrollment1.id)
            grade2 = build_grade_create(enrollment_id=enrollment2.id)
            create_grade(db_session, grade1)
            create_grade(db_session, grade2)

            user = build_user_admin()

            # Execute
            result = list_grades(db_session, user)

            # Assert
            assert len(result) == 2

        def test_list_grades_student_own(self, db_session):
            """Estudiante ve solo sus grades."""
            # Setup
            from app.roles.models import Role
            student_role = db_session.query(Role).filter(Role.name == "Estudiante").first()
            if not student_role:
                student_role = Role(name="Estudiante")
                db_session.add(student_role)
                db_session.commit()
            
            student = build_user_student()
            student.roles = [student_role]
            db_session.add(student)
            db_session.commit()

            enrollment_own = build_enrollment_active()
            enrollment_own.user_id = student.id
            enrollment_other = build_enrollment_active()
            db_session.add_all([enrollment_own, enrollment_other])
            db_session.commit()

            grade_own = build_grade_create(enrollment_id=enrollment_own.id)
            grade_other = build_grade_create(enrollment_id=enrollment_other.id)
            create_grade(db_session, grade_own)
            create_grade(db_session, grade_other)

            # Execute
            result = list_grades(db_session, student)

            # Assert
            assert len(result) == 1
            assert result[0].enrollment_id == enrollment_own.id

    class TestGetGrade:
        """Pruebas para get_grade."""

        def test_get_grade_success_admin(self, db_session):
            """Admin obtiene grade exitosamente."""
            # Setup
            enrollment = build_enrollment_active()
            db_session.add(enrollment)
            db_session.commit()

            grade = build_grade_create(enrollment_id=enrollment.id)
            created = create_grade(db_session, grade)

            user = build_user_admin()

            # Execute
            result = get_grade(db_session, created.id, user)

            # Assert
            assert result.id == created.id

        def test_get_grade_not_found(self, db_session):
            """Fallar si grade no existe."""
            user = build_user_admin()

            with pytest.raises(NotFoundError, match="Calificación no encontrada"):
                get_grade(db_session, 999, user)

        def test_get_grade_student_access_denied(self, db_session):
            """Estudiante no puede acceder a grade de otro."""
            # Setup
            from app.roles.models import Role
            student_role = Role(name="Estudiante")
            db_session.add(student_role)
            db_session.commit()  # Ensure role is committed

            student = build_user_student()
            student.roles = [student_role]
            db_session.add(student)
            db_session.commit()  # Ensure user with role is committed

            other_student = build_user_student(email="other@example.com")
            db_session.add(other_student)
            db_session.commit()

            enrollment_other = build_enrollment_active()
            enrollment_other.user_id = other_student.id
            db_session.add(enrollment_other)
            db_session.commit()

            grade = build_grade_create(enrollment_id=enrollment_other.id)
            created = create_grade(db_session, grade)

            # Execute & Assert
            with pytest.raises(ConflictError, match="Acceso no permitido"):
                get_grade(db_session, created.id, student)

    class TestUpdateGrade:
        """Pruebas para update_grade."""

        def test_update_grade_success(self, db_session):
            """Actualizar grade exitosamente."""
            # Setup
            enrollment = build_enrollment_active()
            db_session.add(enrollment)
            db_session.commit()

            grade = build_grade_create(enrollment_id=enrollment.id, value=80.0)
            created = create_grade(db_session, grade)

            data = build_grade_update(value=85.0, notes="Mejoró")
            user = build_user_admin()

            # Execute
            result = update_grade(db_session, created.id, data, user)

            # Assert
            assert result.value == Decimal("85.00")
            assert result.notes == "Mejoró"

        def test_update_grade_not_found(self, db_session):
            """Fallar si grade no existe."""
            data = build_grade_update(value=90.0)
            user = build_user_admin()

            with pytest.raises(NotFoundError, match="Calificación no encontrada"):
                update_grade(db_session, 999, data, user)

    class TestDeleteGrade:
        """Pruebas para delete_grade."""

        def test_delete_grade_success(self, db_session):
            """Eliminar grade exitosamente."""
            # Setup
            enrollment = build_enrollment_active()
            db_session.add(enrollment)
            db_session.commit()

            grade = build_grade_create(enrollment_id=enrollment.id)
            created = create_grade(db_session, grade)

            user = build_user_admin()

            # Execute
            delete_grade(db_session, created.id, user)

            # Assert
            assert db_session.get(created.__class__, created.id) is None

        def test_delete_grade_not_found(self, db_session):
            """Fallar si grade no existe."""
            user = build_user_admin()

            with pytest.raises(NotFoundError, match="Calificación no encontrada"):
                delete_grade(db_session, 999, user)