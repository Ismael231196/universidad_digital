from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EnrollmentCreate(BaseModel):
    """Datos requeridos para crear una inscripción."""

    user_id: int = Field(ge=1)
    subject_id: int = Field(ge=1)
    period_id: int = Field(ge=1)



class EnrollmentUpdate(BaseModel):
    """Datos permitidos para actualizar una inscripción."""
    user_id: int | None = None
    subject_id: int | None = None
    period_id: int | None = None
    is_active: bool | None = None


class EnrollmentResponse(BaseModel):
    """Datos expuestos al cliente."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject_id: int
    period_id: int
    is_active: bool
    enrolled_at: datetime
    user_full_name: str | None = None
    user_email: str | None = None
    subject_name: str | None = None
    subject_code: str | None = None
    period_name: str | None = None
    period_code: str | None = None
