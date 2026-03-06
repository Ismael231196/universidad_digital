from __future__ import annotations

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.database import Base
from app.main import app


TEST_DATABASE_URL = "sqlite:///./test_universidad.db"


@pytest.fixture(scope="session", autouse=True)
def _test_env() -> None:
  """Configura variables de entorno para entorno de pruebas."""
  os.environ["APP_ENV"] = "test"
  os.environ["APP_DATABASE_URL"] = TEST_DATABASE_URL


@pytest.fixture(scope="session")
def engine() -> Generator:
  """Motor de BD temporal para toda la sesión de tests."""
  engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
  Base.metadata.create_all(bind=engine)
  try:
    yield engine
  finally:
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("test_universidad.db"):
      os.remove("test_universidad.db")


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


@pytest.fixture(scope="session")
def api_client() -> Generator[TestClient, None, None]:
  """Cliente de pruebas para la API FastAPI."""
  with TestClient(app) as client:
    yield client

