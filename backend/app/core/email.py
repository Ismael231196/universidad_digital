from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, full_name: str, reset_token: str) -> None:
    """Envía el email de restablecimiento de contraseña via Mailtrap SMTP."""
    if not settings.mail_user or not settings.mail_pass:
        logger.warning(
            "MAIL_USER / MAIL_PASS no configurados. "
            "Email de restablecimiento no enviado."
        )
        return

    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3748;">🎓 Universidad Digital</h2>
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

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Restablecimiento de contraseña - Universidad Digital"
    msg["From"] = settings.mail_from
    msg["To"] = to_email
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(settings.mail_host, settings.mail_port) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(settings.mail_user, settings.mail_pass)
            smtp.sendmail(settings.mail_from, to_email, msg.as_string())
        logger.info("Email de restablecimiento enviado a %s via Mailtrap SMTP", to_email)
    except Exception:
        logger.exception("Error al enviar email de restablecimiento a %s", to_email)
        raise
