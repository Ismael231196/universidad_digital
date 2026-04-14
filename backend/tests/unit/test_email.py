from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.core.email import EmailDeliveryError, send_password_reset_email


@pytest.mark.unit
def test_send_password_reset_email_sin_configuracion_mailtrap_relanza_error() -> None:
    """Si falta configuración de Mailtrap API, se lanza error controlado."""
    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.mt.MailtrapClient") as mock_client_cls,
    ):
        mock_settings.mailtrap_api_token = None
        mock_settings.mailtrap_inbox_id = "12345"
        mock_settings.mail_from = "noreply@universidad.com"

        with pytest.raises(EmailDeliveryError):
            send_password_reset_email("dest@example.com", "Usuario", "token123")

    mock_client_cls.assert_not_called()


@pytest.mark.unit
def test_send_password_reset_email_envia_via_mailtrap_api() -> None:
    """Con configuración válida, construye y envía email vía Mailtrap Sandbox API."""
    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.mt.Mail") as mock_mail_cls,
        patch("app.core.email.mt.MailtrapClient") as mock_client_cls,
    ):
        mock_settings.mailtrap_api_token = "token_abc"
        mock_settings.mailtrap_inbox_id = "1000001"
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        send_password_reset_email("dest@example.com", "María", "abc123")

    mock_mail_cls.assert_called_once()
    mail_call_kwargs = mock_mail_cls.call_args.kwargs
    assert mail_call_kwargs["subject"] == "Restablecimiento de contraseña - Universidad Digital"
    assert "abc123" in mail_call_kwargs["html"]
    assert "https://app.universidad.com/reset-password?token=abc123" in mail_call_kwargs["html"]
    assert "https://app.universidad.com/reset-password?token=abc123" in mail_call_kwargs["text"]

    mock_client_cls.assert_called_once_with(
        token="token_abc",
        sandbox=True,
        inbox_id="1000001",
    )
    mock_client.send.assert_called_once_with(mock_mail_cls.return_value)


@pytest.mark.unit
def test_send_password_reset_email_fallo_mailtrap_relanza_error() -> None:
    """Si Mailtrap falla, se re-lanza como EmailDeliveryError."""
    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.mt.MailtrapClient") as mock_client_cls,
    ):
        mock_settings.mailtrap_api_token = "token_abc"
        mock_settings.mailtrap_inbox_id = "1000001"
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        mock_client = MagicMock()
        mock_client.send.side_effect = RuntimeError("mailtrap unavailable")
        mock_client_cls.return_value = mock_client

        with pytest.raises(EmailDeliveryError):
            send_password_reset_email("dest@example.com", "Juan", "token_x")
