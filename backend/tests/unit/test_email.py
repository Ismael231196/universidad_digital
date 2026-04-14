from __future__ import annotations

import email as email_lib
import logging
from unittest.mock import MagicMock, patch

import pytest

from app.core.email import send_password_reset_email


@pytest.mark.unit
def test_send_password_reset_email_sin_credenciales(caplog: pytest.LogCaptureFixture) -> None:
    """Si las credenciales SMTP no están configuradas, se loguea warning y no se envía nada."""
    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.smtplib.SMTP") as mock_smtp_cls,
    ):
        mock_settings.mail_user = None
        mock_settings.mail_pass = None

        with caplog.at_level(logging.WARNING, logger="app.core.email"):
            send_password_reset_email("dest@example.com", "Usuario", "token123")

        mock_smtp_cls.assert_not_called()
        assert "MAIL_USER" in caplog.text


@pytest.mark.unit
def test_send_password_reset_email_envia_via_smtp() -> None:
    """Con credenciales configuradas, se conecta al servidor SMTP y envía el email."""
    mock_smtp_instance = MagicMock()
    mock_smtp_cls = MagicMock(return_value=_make_context_manager(mock_smtp_instance))

    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.smtplib.SMTP", mock_smtp_cls),
    ):
        mock_settings.mail_host = "sandbox.smtp.mailtrap.io"
        mock_settings.mail_port = 2525
        mock_settings.mail_user = "test_user"
        mock_settings.mail_pass = "test_pass"
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        send_password_reset_email("dest@example.com", "María", "abc123")

    mock_smtp_cls.assert_called_once_with("sandbox.smtp.mailtrap.io", 2525)
    mock_smtp_instance.ehlo.assert_called_once()
    mock_smtp_instance.starttls.assert_called_once()
    mock_smtp_instance.login.assert_called_once_with("test_user", "test_pass")
    mock_smtp_instance.sendmail.assert_called_once()

    # Verificar que el enlace contiene el token y la URL del frontend
    raw_email: str = mock_smtp_instance.sendmail.call_args[0][2]
    parsed = email_lib.message_from_string(raw_email)
    body = ""
    if parsed.is_multipart():
        for part in parsed.walk():
            if part.get_content_type() == "text/html":
                payload = part.get_payload(decode=True)
                body = payload.decode() if isinstance(payload, bytes) else str(payload)
    else:
        payload = parsed.get_payload(decode=True)
        body = payload.decode() if isinstance(payload, bytes) else str(payload)
    assert "abc123" in body
    assert "https://app.universidad.com/reset-password" in body


@pytest.mark.unit
def test_send_password_reset_email_relanza_excepcion() -> None:
    """Si el servidor SMTP falla, la excepción se re-lanza."""
    mock_smtp_instance = MagicMock()
    mock_smtp_instance.sendmail.side_effect = OSError("connection refused")
    mock_smtp_cls = MagicMock(return_value=_make_context_manager(mock_smtp_instance))

    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.smtplib.SMTP", mock_smtp_cls),
    ):
        mock_settings.mail_host = "sandbox.smtp.mailtrap.io"
        mock_settings.mail_port = 2525
        mock_settings.mail_user = "test_user"
        mock_settings.mail_pass = "test_pass"
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
