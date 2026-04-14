from __future__ import annotations

import email as email_lib
import logging
import smtplib
from unittest.mock import MagicMock, patch

import pytest

from app.core.email import SMTP_TIMEOUT, send_password_reset_email


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
    """Con credenciales SMTP configuradas, conecta, autentica y envía el mensaje."""
    mock_smtp_instance = MagicMock()
    mock_smtp_cls = MagicMock(return_value=_make_context_manager(mock_smtp_instance))

    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.smtplib.SMTP", mock_smtp_cls),
    ):
        mock_settings.mail_user = "smtp_user"
        mock_settings.mail_pass = "smtp_pass"
        mock_settings.mail_host = "sandbox.smtp.mailtrap.io"
        mock_settings.mail_port = 2525
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        send_password_reset_email("dest@example.com", "María", "abc123")

    mock_smtp_cls.assert_called_once_with("sandbox.smtp.mailtrap.io", 2525, timeout=SMTP_TIMEOUT)
    mock_smtp_instance.starttls.assert_called_once()
    mock_smtp_instance.login.assert_called_once_with("smtp_user", "smtp_pass")

    sendmail_call = mock_smtp_instance.sendmail.call_args
    assert sendmail_call[0][0] == "noreply@universidad.com"
    assert sendmail_call[0][1] == "dest@example.com"
    raw_message = sendmail_call[0][2]
    parsed = email_lib.message_from_string(raw_message)
    html_body = _get_html_payload(parsed)
    assert "abc123" in html_body
    assert "https://app.universidad.com/reset-password" in html_body


@pytest.mark.unit
def test_send_password_reset_email_puerto_465_usa_smtp_ssl() -> None:
    """Cuando mail_port es 465, usa SMTP_SSL (sin STARTTLS)."""
    mock_smtp_instance = MagicMock()
    mock_smtp_ssl_cls = MagicMock(return_value=_make_context_manager(mock_smtp_instance))

    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.smtplib.SMTP_SSL", mock_smtp_ssl_cls),
        patch("app.core.email.smtplib.SMTP") as mock_smtp_cls,
    ):
        mock_settings.mail_user = "smtp_user"
        mock_settings.mail_pass = "smtp_pass"
        mock_settings.mail_host = "smtp.example.com"
        mock_settings.mail_port = 465
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        send_password_reset_email("dest@example.com", "Juan", "tok456")

    mock_smtp_ssl_cls.assert_called_once_with("smtp.example.com", 465, timeout=SMTP_TIMEOUT)
    mock_smtp_cls.assert_not_called()
    mock_smtp_instance.login.assert_called_once_with("smtp_user", "smtp_pass")
    mock_smtp_instance.starttls.assert_not_called()


@pytest.mark.unit
def test_send_password_reset_email_relanza_excepcion() -> None:
    """Si la conexión SMTP falla, la excepción se re-lanza."""
    mock_smtp_cls = MagicMock(side_effect=OSError("connection refused"))

    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.smtplib.SMTP", mock_smtp_cls),
    ):
        mock_settings.mail_user = "smtp_user"
        mock_settings.mail_pass = "smtp_pass"
        mock_settings.mail_host = "sandbox.smtp.mailtrap.io"
        mock_settings.mail_port = 2525
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


def _get_html_payload(msg: email_lib.message.Message) -> str:
    """Extract and decode the HTML payload from a (possibly multipart) MIME message."""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/html":
                return part.get_payload(decode=True).decode("utf-8")
        raise ValueError("No text/html part found in multipart message")
    raw = msg.get_payload(decode=True)
    if raw is None:
        raise ValueError("Could not decode message payload")
    return raw.decode("utf-8")
