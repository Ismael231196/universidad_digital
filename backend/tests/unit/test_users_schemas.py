"""Unit tests for app/users/schemas.py."""
from __future__ import annotations

from datetime import datetime

import pytest

pytestmark = pytest.mark.unit


class TestUserResponseCoerceRoles:
    """Tests for the _coerce_roles field validator in UserResponse."""

    def _make_response(self, roles):
        from app.users.schemas import UserResponse

        return UserResponse(
            id=1,
            email="test@example.com",
            full_name="Test User",
            is_active=True,
            created_at=datetime(2024, 1, 1),
            roles=roles,
        )

    def test_roles_none_returns_empty(self):
        result = self._make_response(None)
        assert result.roles == []

    def test_roles_empty_list(self):
        result = self._make_response([])
        assert result.roles == []

    def test_roles_list_of_strings(self):
        result = self._make_response(["Administrador", "Docente"])
        assert result.roles == ["Administrador", "Docente"]

    def test_roles_list_of_objects_with_name(self):
        class FakeRole:
            name = "Estudiante"

        result = self._make_response([FakeRole()])
        assert result.roles == ["Estudiante"]

    def test_roles_single_non_list_value(self):
        result = self._make_response("Administrador")
        assert result.roles == ["Administrador"]
