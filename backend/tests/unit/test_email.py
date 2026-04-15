from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.core.email import EmailDeliveryError, send_password_reset_email


@pytest.mark.unit
def test_send_password_reset_email_sin_configuracion_mailtrap_relanza_error() -> None:
    """Si falta configuración de Mailtrap API, se lanza error controlado."""
    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.httpx.Client") as mock_client_cls,
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
        patch("app.core.email.httpx.Client") as mock_client_cls,
    ):
        mock_settings.mailtrap_api_token = "token_abc"
        mock_settings.mailtrap_inbox_id = "1000001"
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status.return_value = None
        mock_client.post.return_value = mock_response
        mock_client_cls.return_value.__enter__.return_value = mock_client

        send_password_reset_email("dest@example.com", "María", "abc123")

    mock_client_cls.assert_called_once_with(timeout=15.0)
    mock_client.post.assert_called_once()

    post_args = mock_client.post.call_args
    assert post_args.args[0] == "https://sandbox.api.mailtrap.io/api/send/1000001"
    assert post_args.kwargs["headers"] == {
        "Authorization": "Bearer token_abc",
        "Content-Type": "application/json",
    }
    assert post_args.kwargs["json"]["subject"] == "Restablecimiento de contraseña - Universidad Digital"
    assert post_args.kwargs["json"]["from"] == {"email": "noreply@universidad.com"}
    assert post_args.kwargs["json"]["to"] == [{"email": "dest@example.com"}]
    assert "abc123" in post_args.kwargs["json"]["html"]
    assert "https://app.universidad.com/reset-password?token=abc123" in post_args.kwargs["json"]["html"]
    assert "https://app.universidad.com/reset-password?token=abc123" in post_args.kwargs["json"]["text"]


@pytest.mark.unit
def test_send_password_reset_email_fallo_mailtrap_relanza_error() -> None:
    """Si Mailtrap falla, se re-lanza como EmailDeliveryError."""
    with (
        patch("app.core.email.settings") as mock_settings,
        patch("app.core.email.httpx.Client") as mock_client_cls,
    ):
        mock_settings.mailtrap_api_token = "token_abc"
        mock_settings.mailtrap_inbox_id = "1000001"
        mock_settings.mail_from = "noreply@universidad.com"
        mock_settings.frontend_url = "https://app.universidad.com"
        mock_settings.password_reset_expiration_minutes = 30

        mock_client = MagicMock()
        mock_client.post.side_effect = RuntimeError("mailtrap unavailable")
        mock_client_cls.return_value.__enter__.return_value = mock_client

        with pytest.raises(EmailDeliveryError):
            send_password_reset_email("dest@example.com", "Juan", "token_x")
