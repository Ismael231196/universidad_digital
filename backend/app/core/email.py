from __future__ import annotations

import logging
from urllib.parse import urlencode

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

MAILTRAP_SANDBOX_BASE_URL = "https://sandbox.api.mailtrap.io"


class EmailDeliveryError(RuntimeError):
    """Error al enviar emails de restablecimiento."""


def send_password_reset_email(to_email: str, full_name: str, reset_token: str) -> None:
    """Envía el email de restablecimiento de contraseña vía Mailtrap Sandbox API (HTTP)."""
    if not settings.mailtrap_api_token or not settings.mailtrap_inbox_id or not settings.mail_from:
        logger.error("MAILTRAP_API_TOKEN / MAILTRAP_INBOX_ID / MAIL_FROM no configurados.")
        raise EmailDeliveryError("Configuración de email incompleta.")

    query = urlencode({"token": reset_token})
    reset_url = f"{settings.frontend_url.rstrip('/')}/reset-password?{query}"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3748;">Universidad Digital</h2>
        <h3>Restablecimiento de contraseña</h3>
        <p>Hola <strong>{full_name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Haz clic en el botón a continuación para crear una nueva contraseña:</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}"
               style="background-color: #4f46e5; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
                Restablecer contraseña
            </a>
        </p>
        <p style="color: #718096; font-size: 14px;">
            Este enlace expira en {settings.password_reset_expiration_minutes} minutos.<br>
            Si no solicitaste este cambio, puedes ignorar este email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #a0aec0; font-size: 12px;">
            Universidad Digital &mdash; Portal Académico
        </p>
    </div>
    """

    text_content = (
        f"Hola {full_name},\n\n"
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta.\n"
        f"Usa este enlace para crear una nueva contraseña: {reset_url}\n\n"
        f"Este enlace expira en {settings.password_reset_expiration_minutes} minutos.\n"
        "Si no solicitaste este cambio, puedes ignorar este email."
    )

    # Payload mínimo para evitar 400 Bad Request por schema
    payload = {
        "from": {"email": settings.mail_from},
        "to": [{"email": to_email}],
        "subject": "Restablecimiento de contraseña - Universidad Digital",
        "text": text_content,
        "html": html_content,
    }

    url = f"{MAILTRAP_SANDBOX_BASE_URL}/api/send/{int(settings.mailtrap_inbox_id)}"
    headers = {
        "Authorization": f"Bearer {settings.mailtrap_api_token}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, json=payload, headers=headers)

            # Log del error real de Mailtrap para depurar (muy útil en Railway)
            if resp.status_code >= 400:
                logger.error("Mailtrap error status=%s body=%s", resp.status_code, resp.text)

            resp.raise_for_status()

        logger.info("Email de restablecimiento enviado a %s via Mailtrap Sandbox API", to_email)
    except Exception as exc:
        logger.exception("Error al enviar email de restablecimiento a %s", to_email)
        raise EmailDeliveryError("No se pudo enviar el email de restablecimiento.") from exc