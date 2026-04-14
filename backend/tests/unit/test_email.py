from __future__ import annotations

import logging
from unittest.mock import MagicMock, patch

import pytest

from app.core.email import _HTTP_TIMEOUT, _MAILTRAP_SEND_URL, send_password_reset_email


@pytest.mark.unit
def test_send_password_reset_email_sin_credenciales(caplog: pytest.LogCaptureFixture) -> None:
    """Si las credenciales API no están configuradas, se loguea warning y no se envía nada."""
    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.httpx.Client") as mock_client_cls,
    ):
        mock_settings.mailtrap_api_token = None
        mock_settings.mailtrap_inbox_id = None

        with caplog.at_level(logging.WARNING, logger="app.core.email"):
            send_password_reset_email("dest@example.com", "Usuario", "token123")

        mock_client_cls.assert_not_called()
        assert "MAILTRAP_API_TOKEN" in caplog.text


@pytest.mark.unit
def test_send_password_reset_email_envia_via_api() -> None:
    """Con credenciales configuradas, hace POST a Mailtrap Email API con el token y la URL."""
    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_http_client = MagicMock()
    mock_http_client.post.return_value = mock_response
    mock_client_cls = MagicMock(return_value=_make_context_manager(mock_http_client))

    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.httpx.Client", mock_client_cls),
    ):
        mock_settings.mailtrap_api_token = "test_api_token"
        mock_settings.mailtrap_inbox_id = "123456"
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        send_password_reset_email("dest@example.com", "María", "abc123")

    mock_client_cls.assert_called_once_with(timeout=_HTTP_TIMEOUT)
    mock_http_client.post.assert_called_once()

    call_kwargs = mock_http_client.post.call_args
    url = call_kwargs[0][0]
    expected_url = _MAILTRAP_SEND_URL.format(inbox_id="123456")
    assert url == expected_url

    headers = call_kwargs[1]["headers"]
    assert headers["Authorization"] == "Bearer test_api_token"

    body = call_kwargs[1]["json"]
    assert body["from"]["email"] == "noreply@universidad.com"
    assert body["to"][0]["email"] == "dest@example.com"
    assert "abc123" in body["html"]
    assert "https://app.universidad.com/reset-password" in body["html"]
    mock_response.raise_for_status.assert_called_once()


@pytest.mark.unit
def test_send_password_reset_email_relanza_excepcion() -> None:
    """Si la llamada HTTP falla, la excepción se re-lanza."""
    mock_http_client = MagicMock()
    mock_http_client.post.side_effect = OSError("connection refused")
    mock_client_cls = MagicMock(return_value=_make_context_manager(mock_http_client))

    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.httpx.Client", mock_client_cls),
    ):
        mock_settings.mailtrap_api_token = "test_api_token"
        mock_settings.mailtrap_inbox_id = "123456"
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        with pytest.raises(OSError):
            send_password_reset_email("dest@example.com", "Juan", "token_x")


# ── helpers ──────────────────────────────────────────────────────────────────

class _CtxManager:
    """Context manager wrapper that delegates to a mock instance."""

    def __init__(self, instance: MagicMock) -> None:
        self._instance = instance

    def __enter__(self) -> MagicMock:
        return self._instance

    def __exit__(self, *_: object) -> None:
        pass


def _make_context_manager(instance: MagicMock) -> _CtxManager:
    return _CtxManager(instance)
