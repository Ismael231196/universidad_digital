from __future__ import annotations

import os
from collections.abc import Generator

# set test environment early before any app imports
TEST_DATABASE_URL = "sqlite:///./test_universidad.db"
os.environ["APP_ENV"] = "test"
os.environ["APP_DATABASE_URL"] = TEST_DATABASE_URL

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# import after environment is configured
from app.core.config import settings
from app.core.database import Base
from app.main import app

# Module-level engine created once for all tests
_test_engine = None


def get_test_engine():
  """Get or create the test engine (shared across all fixtures)."""
  global _test_engine
  if _test_engine is None:
    _test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
  return _test_engine


@pytest.fixture(scope="session", autouse=True)
def _test_env() -> None:
  """Ensure configuration and database engine use test settings.

  Environment variables already set at import time.  This fixture reloads
  the config object and rebuilds the app's engine to guarantee everything
  points at sqlite.
  """
  # reload config module so settings picks up env values
  import importlib
  import app.core.config as _cfg
  importlib.reload(_cfg)

  # reconfigure the database module to use the shared test engine
  import app.core.database as _db
  _db.engine = get_test_engine()
  _db.SessionLocal = sessionmaker(bind=_db.engine, autocommit=False, autoflush=False, class_=Session)
  
  # Initialize database schema
  Base.metadata.create_all(bind=_db.engine)


@pytest.fixture(scope="session")
def engine() -> Generator:
  """Motor de BD temporal para toda la sesión de tests."""
  eng = get_test_engine()
  try:
    yield eng
  finally:
    # cleanup at end of session
    Base.metadata.drop_all(bind=eng)
    eng.dispose()
    if os.path.exists("test_universidad.db"):
      try:
        os.remove("test_universidad.db")
      except PermissionError:
        pass



@pytest.fixture(scope="function")
def db_session(engine) -> Generator[Session, None, None]:
  """Sesión de BD aislada por test (rollback al final)."""
  TestingSessionLocal = sessionmaker(
    bind=engine, autocommit=False, autoflush=False, class_=Session
  )
  db = TestingSessionLocal()
  try:
    yield db
    db.rollback()
  finally:
    db.close()


@pytest.fixture(scope="function", autouse=True)
def _clean_database(db_session: Session) -> Generator[None, None, None]:
  """Aisla datos entre tests limpiando todas las tablas en cada ejecución."""
  # Cleanup before test
  for table in reversed(Base.metadata.sorted_tables):
    db_session.execute(table.delete())
  db_session.commit()

  yield

  # Cleanup after test
  db_session.rollback()
  for table in reversed(Base.metadata.sorted_tables):
    db_session.execute(table.delete())
  db_session.commit()


@pytest.fixture(scope="session")
def api_client(engine) -> Generator[TestClient, None, None]:
  """Cliente de pruebas para la API FastAPI.
  
  Usa elmotor de test configurado globalmente.
  """
  with TestClient(app) as client:
    yield client


@pytest.fixture(scope="function")
def auth_headers_admin(api_client: TestClient, db_session: Session) -> dict[str, str]:
    """Headers de autenticación para usuario admin."""
    from app.core.security import hash_password
    from app.roles.models import Role
    from app.users.models import User

    # Crear rol admin si no existe
    admin_role = db_session.query(Role).filter(Role.name == "Administrador").first()
    if not admin_role:
        admin_role = Role(name="Administrador")
        db_session.add(admin_role)
        db_session.commit()

    # Crear usuario admin si no existe
    admin_user = db_session.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@example.com",
            full_name="Administrador del Sistema",
            hashed_password=hash_password("AdminPassword123"),
            is_active=True,
        )
        admin_user.roles = [admin_role]
        db_session.add(admin_user)
        db_session.commit()

    # Generar token directamente usando servicios
    from app.auth.services import authenticate_user, create_token_for_user

    user = authenticate_user(db_session, "admin@example.com", "AdminPassword123")
    token, _, _ = create_token_for_user(user)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def auth_headers_student(api_client: TestClient, db_session: Session) -> dict[str, str]:
    """Headers de autenticación para usuario estudiante."""
    from app.core.security import hash_password
    from app.roles.models import Role
    from app.users.models import User

    # Crear rol estudiante si no existe
    student_role = db_session.query(Role).filter(Role.name == "Estudiante").first()
    if not student_role:
        student_role = Role(name="Estudiante")
        db_session.add(student_role)
        db_session.commit()

    # Crear usuario estudiante si no existe
    student_user = db_session.query(User).filter(User.email == "student@example.com").first()
    if not student_user:
        student_user = User(
            email="student@example.com",
            full_name="Estudiante de Prueba",
            hashed_password=hash_password("StudentPassword123"),
            is_active=True,
        )
        student_user.roles = [student_role]
        db_session.add(student_user)
        db_session.commit()

    # Generar token directamente usando servicios
    from app.auth.services import authenticate_user, create_token_for_user

    user = authenticate_user(db_session, "student@example.com", "StudentPassword123")
    token, _, _ = create_token_for_user(user)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def auth_headers_teacher(api_client: TestClient, db_session: Session) -> dict[str, str]:
    """Headers de autenticación para usuario docente."""
    from app.core.security import hash_password
    from app.roles.models import Role
    from app.users.models import User

    # Crear rol docente si no existe
    teacher_role = db_session.query(Role).filter(Role.name == "Docente").first()
    if not teacher_role:
        teacher_role = Role(name="Docente")
        db_session.add(teacher_role)
        db_session.commit()

    # Crear usuario profesor si no existe
    teacher_user = db_session.query(User).filter(User.email == "teacher@example.com").first()
    if not teacher_user:
        teacher_user = User(
            email="teacher@example.com",
            full_name="Profesor de Prueba",
            hashed_password=hash_password("TeacherPassword123"),
            is_active=True,
        )
        teacher_user.roles = [teacher_role]
        db_session.add(teacher_user)
        db_session.commit()

    # Generar token directamente usando servicios
    from app.auth.services import authenticate_user, create_token_for_user

    user = authenticate_user(db_session, "teacher@example.com", "TeacherPassword123")
    token, _, _ = create_token_for_user(user)
    return {"Authorization": f"Bearer {token}"}

