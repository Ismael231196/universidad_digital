from __future__ import annotations

from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.periods.schemas import AcademicPeriodCreate, AcademicPeriodUpdate
from app.periods.services import (
    create_period,
    deactivate_period,
    get_period,
    list_periods,
    update_period,
)


@pytest.mark.unit
class TestPeriodsServices:
    def test_create_period_ok(self, db_session: Session) -> None:
        data = AcademicPeriodCreate(
            code="2026-1",
            name="Periodo 2026-1",
            start_date=date(2026, 1, 10),
            end_date=date(2026, 5, 30),
        )

        period = create_period(db_session, data)

        assert period.id is not None
        assert period.code == "2026-1"
        assert period.is_active is True

    def test_create_period_duplicate_code(self, db_session: Session) -> None:
        create_period(
            db_session,
            AcademicPeriodCreate(
                code="2026-1",
                name="Periodo A",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 6, 1),
            ),
        )

        with pytest.raises(ConflictError, match="código de periodo ya existe"):
            create_period(
                db_session,
                AcademicPeriodCreate(
                    code="2026-1",
                    name="Periodo B",
                    start_date=date(2026, 2, 1),
                    end_date=date(2026, 7, 1),
                ),
            )

    def test_create_period_end_before_start(self, db_session: Session) -> None:
        with pytest.raises(ValueError, match="fecha de fin"):
            AcademicPeriodCreate(
                code="2026-2",
                name="Invalido",
                start_date=date(2026, 7, 1),
                end_date=date(2026, 6, 1),
            )

    def test_list_periods_empty(self, db_session: Session) -> None:
        assert list_periods(db_session) == []

    def test_list_periods_order(self, db_session: Session) -> None:
        create_period(
            db_session,
            AcademicPeriodCreate(
                code="2026-1",
                name="Periodo 1",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 6, 1),
            ),
        )
        create_period(
            db_session,
            AcademicPeriodCreate(
                code="2026-2",
                name="Periodo 2",
                start_date=date(2026, 7, 1),
                end_date=date(2026, 12, 1),
            ),
        )

        periods = list_periods(db_session)

        assert len(periods) == 2
        assert periods[0].id < periods[1].id

    def test_get_period_not_found(self, db_session: Session) -> None:
        with pytest.raises(NotFoundError, match="Periodo académico no encontrado"):
            get_period(db_session, 999)

    def test_update_period_name_dates_active(self, db_session: Session) -> None:
        period = create_period(
            db_session,
            AcademicPeriodCreate(
                code="2026-1",
                name="Periodo Original",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 6, 1),
            ),
        )

        updated = update_period(
            db_session,
            period.id,
            AcademicPeriodUpdate(
                name="Periodo Actualizado",
                start_date=date(2026, 1, 15),
                end_date=date(2026, 6, 15),
                is_active=False,
            ),
        )

        assert updated.name == "Periodo Actualizado"
        assert updated.start_date == date(2026, 1, 15)
        assert updated.end_date == date(2026, 6, 15)
        assert updated.is_active is False

    def test_update_period_invalid_partial_dates(self, db_session: Session) -> None:
        period = create_period(
            db_session,
            AcademicPeriodCreate(
                code="2026-1",
                name="Periodo",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 6, 1),
            ),
        )

        with pytest.raises(ConflictError, match="fecha de fin"):
            update_period(
                db_session,
                period.id,
                AcademicPeriodUpdate(start_date=date(2026, 7, 1)),
            )

        with pytest.raises(ConflictError, match="fecha de fin"):
            update_period(
                db_session,
                period.id,
                AcademicPeriodUpdate(end_date=date(2025, 12, 31)),
            )

    def test_deactivate_period(self, db_session: Session) -> None:
        period = create_period(
            db_session,
            AcademicPeriodCreate(
                code="2026-1",
                name="Periodo",
                start_date=date(2026, 1, 1),
                end_date=date(2026, 6, 1),
            ),
        )

        deactivated = deactivate_period(db_session, period.id)

        assert deactivated.is_active is False
