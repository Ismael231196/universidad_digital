import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.grades.schemas import GradeCreate

from tests.factories.enrollments import build_enrollment_active
from tests.factories.grades import build_grade_create, build_grade_update
from tests.factories.users import build_user_admin, build_user_student, build_user_teacher
from app.core.database import engine
import uuid


@pytest.fixture
def db_setup_grades(db_session):
    """Setup de datos para pruebas de grades.

    Crea usuarios, subject, period, enrollment y limpia grades previas.
    """
    # Limpiar grades previas
    from app.core.database import SessionLocal
    cleanup_session = SessionLocal()
    try:
        from app.grades.models import Grade
        cleanup_session.query(Grade).delete()
        cleanup_session.commit()
    finally:
        cleanup_session.close()

    from app.grades.models import Grade
    db_session.query(Grade).delete()
    db_session.commit()

    # Crear/obtener usuarios fijos para alinear con auth fixtures
    from app.core.security import hash_password
    from app.roles.models import Role
    from app.users.models import User

    admin_role = db_session.query(Role).filter(Role.name == "Administrador").first()
    if not admin_role:
        admin_role = Role(name="Administrador")
        db_session.add(admin_role)
        db_session.commit()

    student_role = db_session.query(Role).filter(Role.name == "Estudiante").first()
    if not student_role:
        student_role = Role(name="Estudiante")
        db_session.add(student_role)
        db_session.commit()

    teacher_role = db_session.query(Role).filter(Role.name == "Docente").first()
    if not teacher_role:
        teacher_role = Role(name="Docente")
        db_session.add(teacher_role)
        db_session.commit()

    admin = db_session.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            full_name="Administrador del Sistema",
            hashed_password=hash_password("AdminPassword123"),
            is_active=True,
        )
        db_session.add(admin)
        db_session.commit()
    if admin_role not in admin.roles:
        admin.roles.append(admin_role)

    student = db_session.query(User).filter(User.email == "student@example.com").first()
    if not student:
        student = User(
            email="student@example.com",
            full_name="Estudiante de Prueba",
            hashed_password=hash_password("StudentPassword123"),
            is_active=True,
        )
        db_session.add(student)
        db_session.commit()
    if student_role not in student.roles:
        student.roles.append(student_role)

    teacher = db_session.query(User).filter(User.email == "teacher@example.com").first()
    if not teacher:
        teacher = User(
            email="teacher@example.com",
            full_name="Profesor de Prueba",
            hashed_password=hash_password("TeacherPassword123"),
            is_active=True,
        )
        db_session.add(teacher)
        db_session.commit()
    if teacher_role not in teacher.roles:
        teacher.roles.append(teacher_role)

    db_session.commit()

    # Crear subject
    from tests.factories.subjects import build_subject_active
    subject = build_subject_active()
    db_session.add(subject)
    db_session.commit()

    # Crear period
    from tests.factories.periods import build_period_active
    period = build_period_active()
    db_session.add(period)
    db_session.commit()

    # Crear enrollment para el estudiante
    enrollment = build_enrollment_active()
    enrollment.user_id = student.id
    enrollment.subject_id = subject.id
    enrollment.period_id = period.id
    db_session.add(enrollment)
    db_session.commit()

    return {
        "admin": admin,
        "student": student,
        "teacher": teacher,
        "subject": subject,
        "period": period,
        "enrollment": enrollment,
    }


class TestGradesCreate:
    """Pruebas de integración para POST /grades."""

    def test_create_grade_admin_success(self, api_client: TestClient, db_setup_grades, auth_headers_admin):
        """Admin puede crear grade exitosamente."""
        setup = db_setup_grades
        data = build_grade_create(
            enrollment_id=setup["enrollment"].id,
            value=88.5,
            notes="Buen trabajo",
        )

        # Convert Decimal to float for JSON serialization
        json_data = data.model_dump()
        json_data["value"] = float(json_data["value"])

        response = api_client.post("/grades/", json=json_data, headers=auth_headers_admin)
        assert response.status_code == status.HTTP_201_CREATED

        result = response.json()
        assert result["enrollment_id"] == setup["enrollment"].id
        assert result["value"] == 88.5  # Changed from string to float
        assert result["notes"] == "Buen trabajo"

    def test_create_grade_teacher_success(self, api_client: TestClient, db_setup_grades, auth_headers_teacher):
        """Profesor puede crear grade exitosamente."""
        setup = db_setup_grades
        data = build_grade_create(enrollment_id=setup["enrollment"].id, value=92.0)

        json_data = data.model_dump()
        json_data["value"] = float(json_data["value"])

        response = api_client.post("/grades/", json=json_data, headers=auth_headers_teacher)
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_grade_student_forbidden(self, api_client: TestClient, db_setup_grades, auth_headers_student):
        """Estudiante no puede crear grades."""
        setup = db_setup_grades
        data = build_grade_create(enrollment_id=setup["enrollment"].id, value=85.0)

        json_data = data.model_dump()
        json_data["value"] = float(json_data["value"])

        response = api_client.post("/grades/", json=json_data, headers=auth_headers_student)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_grade_enrollment_not_found(self, api_client: TestClient, db_setup_grades, auth_headers_admin):
        """Fallar si enrollment no existe."""
        data = build_grade_create(enrollment_id=999, value=75.0)

        json_data = data.model_dump()
        json_data["value"] = float(json_data["value"])

        response = api_client.post("/grades/", json=json_data, headers=auth_headers_admin)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Inscripción no encontrada" in response.json()["detail"]

    def test_create_grade_inactive_enrollment(self, api_client: TestClient, db_setup_grades, auth_headers_admin, db_session):
        """Fallar si enrollment está inactiva."""
        setup = db_setup_grades
        setup["enrollment"].is_active = False
        db_session.commit()

        data = build_grade_create(enrollment_id=setup["enrollment"].id, value=70.0)

        json_data = data.model_dump()
        json_data["value"] = float(json_data["value"])

        response = api_client.post("/grades/", json=json_data, headers=auth_headers_admin)
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "Inscripción inactiva" in response.json()["detail"]

    def test_create_grade_invalid_value(self, api_client: TestClient, db_setup_grades, auth_headers_admin):
        """Fallar con valor inválido."""
        setup = db_setup_grades
        data = {"enrollment_id": setup["enrollment"].id, "value": 150.00}  # Valor > 100

        response = api_client.post("/grades/", json=data, headers=auth_headers_admin)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGradesList:
    """Pruebas de integración para GET /grades."""

    def test_list_grades_admin(self, api_client: TestClient, db_setup_grades, auth_headers_admin, db_session):
        """Admin ve todas las grades."""
        setup = db_setup_grades

        # Crear algunas grades
        grade1 = build_grade_create(enrollment_id=setup["enrollment"].id, value=90.0)
        grade2 = build_grade_create(enrollment_id=setup["enrollment"].id, value=85.0)
        from app.grades.services import create_grade
        create_grade(db_session, grade1)
        create_grade(db_session, grade2)

        response = api_client.get("/grades/", headers=auth_headers_admin)
        assert response.status_code == status.HTTP_200_OK

        result = response.json()
        assert len(result) == 2

    def test_list_grades_student_own(self, api_client: TestClient, db_setup_grades, auth_headers_student, db_session):
        """Estudiante ve solo sus grades."""
        setup = db_setup_grades

        # Crear grade para el estudiante
        grade = build_grade_create(enrollment_id=setup["enrollment"].id, value=88.0)
        from app.grades.services import create_grade
        create_grade(db_session, grade)

        response = api_client.get("/grades/", headers=auth_headers_student)
        assert response.status_code == status.HTTP_200_OK

        result = response.json()
        assert len(result) == 1
        assert result[0]["enrollment_id"] == setup["enrollment"].id


class TestGradesGet:
    """Pruebas de integración para GET /grades/{id}."""

    def test_get_grade_admin_success(self, api_client: TestClient, db_setup_grades, auth_headers_admin, db_session):
        """Admin obtiene grade exitosamente."""
        setup = db_setup_grades

        grade = build_grade_create(enrollment_id=setup["enrollment"].id, value=87.5)
        from app.grades.services import create_grade
        created = create_grade(db_session, grade)

        response = api_client.get(f"/grades/{created.id}", headers=auth_headers_admin)
        assert response.status_code == status.HTTP_200_OK

        result = response.json()
        assert result["id"] == created.id
        assert result["value"] == 87.5

    def test_get_grade_not_found(self, api_client: TestClient, db_setup_grades, auth_headers_admin):
        """Fallar si grade no existe."""
        response = api_client.get("/grades/999", headers=auth_headers_admin)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Calificación no encontrada" in response.json()["detail"]

    def test_get_grade_student_access_denied(self, api_client: TestClient, db_setup_grades, auth_headers_student, db_session):
        """Estudiante no puede acceder a grade de otro."""
        # Crear otro estudiante y enrollment
        other_student = build_user_student(email=f"other_{uuid.uuid4().hex[:8]}@example.com")
        # Asignar rol de estudiante
        from app.roles.models import Role
        student_role = db_session.query(Role).filter(Role.name == "Estudiante").first()
        if not student_role:
            student_role = Role(name="Estudiante")
            db_session.add(student_role)
        other_student.roles = [student_role]
        db_session.add(other_student)
        db_session.commit()

        other_enrollment = build_enrollment_active()
        other_enrollment.user_id = other_student.id
        db_session.add(other_enrollment)
        db_session.commit()

        grade = build_grade_create(enrollment_id=other_enrollment.id, value=80.0)
        from app.grades.services import create_grade
        created = create_grade(db_session, grade)

        response = api_client.get(f"/grades/{created.id}", headers=auth_headers_student)
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "Acceso no permitido" in response.json()["detail"]


class TestGradesUpdate:
    """Pruebas de integración para PUT /grades/{id}."""

    def test_update_grade_admin_success(self, api_client: TestClient, db_setup_grades, auth_headers_admin, db_session):
        """Admin actualiza grade exitosamente."""
        setup = db_setup_grades

        grade = build_grade_create(enrollment_id=setup["enrollment"].id, value=80.0)
        from app.grades.services import create_grade
        created = create_grade(db_session, grade)

        data = build_grade_update(value=85.0, notes="Mejoró")

        json_data = data.model_dump()
        if "value" in json_data and json_data["value"] is not None:
            json_data["value"] = float(json_data["value"])

        response = api_client.put(f"/grades/{created.id}", json=json_data, headers=auth_headers_admin)
        assert response.status_code == status.HTTP_200_OK

        result = response.json()
        assert result["value"] == 85.0
        assert result["notes"] == "Mejoró"

    def test_update_grade_student_forbidden(self, api_client: TestClient, db_setup_grades, auth_headers_student, db_session):
        """Estudiante no puede actualizar grades."""
        setup = db_setup_grades

        grade = build_grade_create(enrollment_id=setup["enrollment"].id, value=75.0)
        from app.grades.services import create_grade
        created = create_grade(db_session, grade)

        data = build_grade_update(value=80.0)

        json_data = data.model_dump()
        if "value" in json_data and json_data["value"] is not None:
            json_data["value"] = float(json_data["value"])

        response = api_client.put(f"/grades/{created.id}", json=json_data, headers=auth_headers_student)
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestGradesDelete:
    """Pruebas de integración para DELETE /grades/{id}."""

    def test_delete_grade_admin_success(self, api_client: TestClient, db_setup_grades, auth_headers_admin, db_session):
        """Admin elimina grade exitosamente."""
        setup = db_setup_grades

        grade = build_grade_create(enrollment_id=setup["enrollment"].id, value=70.0)
        from app.grades.services import create_grade
        created = create_grade(db_session, grade)

        response = api_client.delete(f"/grades/{created.id}", headers=auth_headers_admin)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verificar que se eliminó
        from app.grades.models import Grade
        deleted_grade = db_session.query(Grade).filter(Grade.id == created.id).first()
        assert deleted_grade is None

    def test_delete_grade_student_forbidden(self, api_client: TestClient, db_setup_grades, auth_headers_student, db_session):
        """Estudiante no puede eliminar grades."""
        setup = db_setup_grades

        grade = build_grade_create(enrollment_id=setup["enrollment"].id, value=65.0)
        from app.grades.services import create_grade
        created = create_grade(db_session, grade)

        response = api_client.delete(f"/grades/{created.id}", headers=auth_headers_student)
        assert response.status_code == status.HTTP_403_FORBIDDEN