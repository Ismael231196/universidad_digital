import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.enrollments.schemas import EnrollmentCreate

from tests.factories.enrollments import build_enrollment_create
from tests.factories.periods import build_period_active
from tests.factories.subjects import build_subject_active
from tests.factories.users import build_user_admin, build_user_student
from app.core.database import engine
import uuid


@pytest.fixture
def db_setup_enrollments(db_session):
    """Setup de datos para pruebas de enrollments.

    Genera un estudiante único por ejecución y devuelve también encabezados
    de autenticación para ese usuario. Evita conflictos entre tests y con datos
    previos.
    """
    # Limpiar inscripciones previas USANDO SESSION LOCAL/APP SESSION
    # para asegurar que la limpieza persista correctamente
    from app.core.database import SessionLocal
    from app.enrollments.models import Enrollment
    
    cleanup_session = SessionLocal()
    try:
        count_before = cleanup_session.query(Enrollment).count()
        print(f"DEBUG fixture START: enrollments count BEFORE cleanup = {count_before}")
        cleanup_session.query(Enrollment).delete()
        cleanup_session.commit()
        count_after = cleanup_session.query(Enrollment).count()
        print(f"DEBUG fixture: enrollments count AFTER cleanup = {count_after}")
    finally:
        cleanup_session.close()
    
    # Now verify from test session too
    db_session.query(Enrollment).delete()
    db_session.commit()
    print("DEBUG fixture: test session cleanup complete", db_session.query(Enrollment).count())

    # Crear/obtener admin y asignar rol si hace falta
    from app.users.models import User
    from app.roles.models import Role
    from app.core.security import hash_password

    admin = db_session.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = build_user_admin()
        # asignar rol administrador
        admin_role = db_session.query(Role).filter(Role.name == "Administrador").first()
        if not admin_role:
            admin_role = Role(name="Administrador")
            db_session.add(admin_role)
            db_session.commit()
        admin.roles = [admin_role]
        db_session.add(admin)

    # Crear estudiante único para este test
    import uuid
    student_email = f"student_{uuid.uuid4().hex}@example.com"
    student = User(
        email=student_email,
        full_name="Estudiante de Prueba",
        hashed_password=hash_password("StudentPassword123"),
        is_active=True,
    )
    student_role = db_session.query(Role).filter(Role.name == "Estudiante").first()
    if not student_role:
        student_role = Role(name="Estudiante")
        db_session.add(student_role)
        db_session.commit()
    student.roles = [student_role]
    db_session.add(student)

    # Crear materia y periodo con códigos únicos
    subject = build_subject_active(code=f"MAT{uuid.uuid4().hex[:6]}")
    period = build_period_active(code=f"{uuid.uuid4().hex[:6]}")
    db_session.add_all([subject, period])
    db_session.commit()

    # Generar headers para el estudiante recién creado
    from app.auth.services import authenticate_user, create_token_for_user
    token, _, _ = create_token_for_user(
        authenticate_user(db_session, student_email, "StudentPassword123")
    )
    student_headers = {"Authorization": f"Bearer {token}"}

    return {
        "admin": admin,
        "student": student,
        "subject": subject,
        "period": period,
        "student_headers": student_headers,
    }


class TestEnrollmentsCreate:
    """Pruebas de integración para POST /enrollments."""

    def test_create_enrollment_admin_success(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin, db_session):
        """Admin puede crear enrollment exitosamente."""
        setup = db_setup_enrollments
        data = build_enrollment_create(
            user_id=setup["student"].id,
            subject_id=setup["subject"].id,
            period_id=setup["period"].id,
        )

        # debug: verify no enrollments exist before request
        from app.enrollments.models import Enrollment
        print("DEBUG before create count", db_session.query(Enrollment).count())
        # dispose engine to ensure fresh connection snapshot
        engine.dispose()
        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)
        if response.status_code != status.HTTP_201_CREATED:
            print("DEBUG response", response.status_code, response.json())
            from app.enrollments.models import Enrollment
            print("DEBUG all enrollments after admin attempt", db_session.query(Enrollment).all())
            print("DEBUG matching enrollments", db_session.query(Enrollment).filter(
                Enrollment.user_id == setup["student"].id,
                Enrollment.subject_id == setup["subject"].id,
                Enrollment.period_id == setup["period"].id,
            ).all())
        assert response.status_code == status.HTTP_201_CREATED
        result = response.json()
        assert result["user_id"] == setup["student"].id
        assert result["subject_id"] == setup["subject"].id
        assert result["period_id"] == setup["period"].id
        assert result["is_active"] is True
        assert result["user_full_name"] == setup["student"].full_name
        assert result["user_email"] == setup["student"].email
        assert result["subject_name"] == setup["subject"].name
        assert result["subject_code"] == setup["subject"].code
        assert result["period_name"] == setup["period"].name
        assert result["period_code"] == setup["period"].code

    def test_create_enrollment_student_own_success(self, api_client: TestClient, db_setup_enrollments):
        """Estudiante puede inscribirse a sí mismo."""
        setup = db_setup_enrollments
        data = build_enrollment_create(
            user_id=setup["student"].id,
            subject_id=setup["subject"].id,
            period_id=setup["period"].id,
        )

        # dispose engine before request to avoid snapshot issues
        engine.dispose()
        response = api_client.post("/enrollments/", json=data.model_dump(), headers=setup["student_headers"])
        if response.status_code != status.HTTP_201_CREATED:
            print("DEBUG response", response.status_code, response.json())
            from app.enrollments.models import Enrollment
            print("DEBUG enrollments visible to student", db_session.query(Enrollment).all())
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_enrollment_student_other_forbidden(self, api_client: TestClient, db_setup_enrollments, db_session):
        """Estudiante no puede inscribir a otro."""
        setup = db_setup_enrollments
        # crear un segundo estudiante
        from app.users.models import User
        from app.core.security import hash_password
        from app.roles.models import Role

        other_student = User(
            email=f"other_{uuid.uuid4().hex}@example.com",
            full_name="Otro Estudiante",
            hashed_password=hash_password("OtherPassword123"),
            is_active=True,
        )
        # asignar rol estudiante
        student_role = db_session.query(Role).filter(Role.name == "Estudiante").first()
        other_student.roles = [student_role]
        db_session.add(other_student)
        db_session.commit()

        data = build_enrollment_create(
            user_id=other_student.id,
            subject_id=setup["subject"].id,
            period_id=setup["period"].id,
        )

        # dispose engine to avoid stale data
        engine.dispose()
        response = api_client.post(
            "/enrollments/",
            json=data.model_dump(),
            headers=setup["student_headers"],
        )
        if response.status_code != status.HTTP_409_CONFLICT:
            print("DEBUG response", response.status_code, response.json())
            from app.enrollments.models import Enrollment
            print("DEBUG enrollments for forbidden check", db_session.query(Enrollment).all())
        # ownership violation is implemented as ConflictError (409) in service
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_create_enrollment_unauthorized(self, api_client: TestClient, db_setup_enrollments):
        """Usuario no autenticado no puede crear."""
        data = build_enrollment_create(
            user_id=1,
            subject_id=1,
            period_id=1,
        )

        response = api_client.post("/enrollments/", json=data.model_dump())

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_enrollment_invalid_user(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin):
        """Debe fallar con usuario inválido."""
        setup = db_setup_enrollments
        data = build_enrollment_create(
            user_id=999,
            subject_id=setup["subject"].id,
            period_id=setup["period"].id,
        )

        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_enrollment_inactive_user(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin, db_session):
        """Debe fallar con usuario inactivo."""
        setup = db_setup_enrollments
        inactive_user = build_user_student(is_active=False)
        db_session.add(inactive_user)
        db_session.commit()

        data = build_enrollment_create(
            user_id=inactive_user.id,
            subject_id=setup["subject"].id,
            period_id=setup["period"].id,
        )

        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_create_enrollment_invalid_subject(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin):
        """Debe fallar con materia inválida."""
        setup = db_setup_enrollments
        data = build_enrollment_create(
            user_id=setup["student"].id,
            subject_id=999,
            period_id=setup["period"].id,
        )

        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_enrollment_inactive_subject(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin, db_session):
        """Debe fallar con materia inactiva."""
        setup = db_setup_enrollments
        inactive_subject = build_subject_active(is_active=False)
        db_session.add(inactive_subject)
        db_session.commit()

        data = build_enrollment_create(
            user_id=setup["student"].id,
            subject_id=inactive_subject.id,
            period_id=setup["period"].id,
        )

        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_create_enrollment_invalid_period(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin):
        """Debe fallar con periodo inválido."""
        setup = db_setup_enrollments
        data = build_enrollment_create(
            user_id=setup["student"].id,
            subject_id=setup["subject"].id,
            period_id=999,
        )

        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_enrollment_inactive_period(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin, db_session):
        """Debe fallar con periodo inactivo."""
        setup = db_setup_enrollments
        inactive_period = build_period_active(is_active=False)
        db_session.add(inactive_period)
        db_session.commit()

        data = build_enrollment_create(
            user_id=setup["student"].id,
            subject_id=setup["subject"].id,
            period_id=inactive_period.id,
        )

        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        assert response.status_code == status.HTTP_409_CONFLICT

    def test_create_enrollment_duplicate(self, api_client: TestClient, db_setup_enrollments, auth_headers_admin):
        """Debe fallar si enrollment ya existe."""
        setup = db_setup_enrollments
        data = build_enrollment_create(
            user_id=setup["student"].id,
            subject_id=setup["subject"].id,
            period_id=setup["period"].id,
        )

        # Crear primera vez
        api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        # Intentar duplicar
        response = api_client.post("/enrollments/", json=data.model_dump(), headers=auth_headers_admin)

        assert response.status_code == status.HTTP_409_CONFLICT
