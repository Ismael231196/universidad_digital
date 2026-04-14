from __future__ import annotations

import logging
import smtplib

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.auth.schemas import ForgotPasswordRequest, LoginRequest, ResetPasswordRequest, TokenResponse
from app.auth.services import (
    authenticate_user,
    confirm_password_reset,
    create_token_for_user,
    extract_token_data,
    request_password_reset,
    revoke_token,
)
from app.core.config import settings
from app.core.deps import get_current_user_dep, get_db
from app.users.schemas import UserResponse


router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger(__name__)


@router.post("/login", response_model=TokenResponse)
def login_endpoint(
    payload: LoginRequest, response: Response, db: Session = Depends(get_db)
) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    token, jti, expires_at = create_token_for_user(user)
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_expiration_minutes * 60,
    )
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> Response:
    token = request.cookies.get(settings.cookie_name)
    if token:
        try:
            jti, expires_at = extract_token_data(token)
            revoke_token(db, jti, expires_at)
        except Exception:  # noqa: BLE001
            pass
    response.delete_cookie(settings.cookie_name)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=UserResponse)
def me_endpoint(user=Depends(get_current_user_dep)) -> UserResponse:
    return UserResponse.model_validate(user, from_attributes=True)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password_endpoint(
    payload: ForgotPasswordRequest, response: Response, db: Session = Depends(get_db)
) -> Response:
    """Solicita el restablecimiento de contraseña. Siempre responde 204 para no revelar emails.
    Si el envío SMTP falla responde 502 para que el cliente muestre un error al usuario.
    """
    try:
        request_password_reset(db, payload.email)
    except (OSError, smtplib.SMTPException):
        logger.exception("Error al procesar solicitud de restablecimiento de contraseña")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se pudo enviar el correo de restablecimiento. Intenta más tarde.",
        )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password_endpoint(
    payload: ResetPasswordRequest, response: Response, db: Session = Depends(get_db)
) -> Response:
    """Confirma el restablecimiento de contraseña con el token recibido por email."""
    confirm_password_reset(db, payload.token, payload.new_password)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
