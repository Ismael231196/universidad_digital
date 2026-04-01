from datetime import date, timedelta

import uuid
from app.periods.models import AcademicPeriod


def build_period_active(
    code: str | None = None,
    name: str | None = None,
    start_date: date = None,
    end_date: date = None,
    is_active: bool = True,
) -> AcademicPeriod:
    """Factory para crear un periodo académico activo."""
    if code is None:
        code = f"2024-1-{uuid.uuid4().hex[:4]}"
    if name is None:
        name = f"Periodo Académico {code}"
    if start_date is None:
        start_date = date.today()
    if end_date is None:
        end_date = start_date + timedelta(days=120)  # 4 meses

    return AcademicPeriod(
        code=code,
        name=name,
        start_date=start_date,
        end_date=end_date,
        is_active=is_active,
    )


def build_period_inactive(
    code: str | None = None,
    name: str | None = None,
    start_date: date = None,
    end_date: date = None,
) -> AcademicPeriod:
    """Factory para crear un periodo académico inactivo."""
    if code is None:
        code = f"2023-2-{uuid.uuid4().hex[:4]}"
    if name is None:
        name = f"Periodo Académico {code}"
    if start_date is None:
        start_date = date.today() - timedelta(days=200)
    if end_date is None:
        end_date = start_date + timedelta(days=120)

    return AcademicPeriod(
        code=code,
        name=name,
        start_date=start_date,
        end_date=end_date,
        is_active=False,
    )


def build_period_custom(
    code: str,
    name: str,
    start_date: date,
    end_date: date,
    is_active: bool = True,
) -> AcademicPeriod:
    """Factory para crear un periodo académico personalizado."""
    return AcademicPeriod(
        code=code,
        name=name,
        start_date=start_date,
        end_date=end_date,
        is_active=is_active,
    )