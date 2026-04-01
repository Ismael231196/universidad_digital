from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, condecimal, field_validator


class GradeCreate(BaseModel):
    """Datos requeridos para registrar una calificación."""

    enrollment_id: int = Field(ge=1)
    value: float = Field(ge=0.0, le=100.0)
    notes: str | None = Field(default=None, max_length=255)


class GradeUpdate(BaseModel):
    """Datos permitidos para actualizar una calificación."""

    value: float | None = Field(default=None, ge=0.0, le=100.0)
    notes: str | None = Field(default=None, max_length=255)


class GradeResponse(BaseModel):
    """Datos expuestos al cliente."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    enrollment_id: int
    value: float
    notes: str | None
    created_at: datetime

    @field_validator("value", mode="before")
    @classmethod
    def convert_decimal_to_float(cls, v):
        """Convert Decimal to float for JSON serialization."""
        if isinstance(v, Decimal):
            return float(v)
        return v
