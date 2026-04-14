from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Credenciales de inicio de sesión."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    """Respuesta con token de acceso."""

    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    """Solicitud de restablecimiento de contraseña."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Nueva contraseña con token de restablecimiento."""

    token: str
    new_password: str = Field(min_length=8, max_length=128)
