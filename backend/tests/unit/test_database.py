"""Unit tests for app/core/database.py."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

pytestmark = pytest.mark.unit


def test_init_db_creates_tables_when_enabled():
    """init_db should call Base.metadata.create_all when auto_create_tables=True."""
    import app.core.database as db_module

    with (
        patch.object(db_module.Base.metadata, "create_all") as mock_create_all,
        patch.object(db_module, "engine", MagicMock()),
        patch("app.core.database.settings") as mock_settings,
    ):
        mock_settings.auto_create_tables = True
        db_module.init_db()
        mock_create_all.assert_called_once()


def test_init_db_skips_when_disabled():
    """init_db should return early when auto_create_tables=False."""
    import app.core.database as db_module

    with (
        patch.object(db_module.Base.metadata, "create_all") as mock_create_all,
        patch("app.core.database.settings") as mock_settings,
    ):
        mock_settings.auto_create_tables = False
        db_module.init_db()
        mock_create_all.assert_not_called()


def test_session_local_is_configured():
    """SessionLocal should be a callable session factory."""
    from app.core.database import SessionLocal

    assert callable(SessionLocal)


def test_engine_exists():
    """engine should be set (may be overridden by conftest for tests)."""
    import app.core.database as db_module

    assert db_module.engine is not None
