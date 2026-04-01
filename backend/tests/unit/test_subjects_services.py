from __future__ import annotations

import pytest
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.subjects.schemas import SubjectCreate, SubjectUpdate
from app.subjects.services import (
    create_subject,
    deactivate_subject,
    get_subject,
    list_subjects,
    update_subject,
)


@pytest.mark.unit
class TestSubjectsServices:
    def test_create_subject_ok(self, db_session: Session) -> None:
        subject = create_subject(
            db_session,
            SubjectCreate(code="MAT101", name="Matematicas", credits=4),
        )

        assert subject.id is not None
        assert subject.code == "MAT101"
        assert subject.credits == 4

    def test_create_subject_duplicate_code(self, db_session: Session) -> None:
        create_subject(db_session, SubjectCreate(code="MAT101", name="Mat A", credits=3))

        with pytest.raises(ConflictError, match="código de materia ya existe"):
            create_subject(db_session, SubjectCreate(code="MAT101", name="Mat B", credits=5))

    def test_list_subjects_empty(self, db_session: Session) -> None:
        assert list_subjects(db_session) == []

    def test_list_subjects_order(self, db_session: Session) -> None:
        create_subject(db_session, SubjectCreate(code="MAT101", name="Matematicas", credits=4))
        create_subject(db_session, SubjectCreate(code="FIS101", name="Fisica", credits=3))

        subjects = list_subjects(db_session)

        assert len(subjects) == 2
        assert subjects[0].id < subjects[1].id

    def test_get_subject_not_found(self, db_session: Session) -> None:
        with pytest.raises(NotFoundError, match="Materia no encontrada"):
            get_subject(db_session, 999)

    def test_update_subject_name_credits_active(self, db_session: Session) -> None:
        subject = create_subject(
            db_session,
            SubjectCreate(code="MAT101", name="Matematicas", credits=4),
        )

        updated = update_subject(
            db_session,
            subject.id,
            SubjectUpdate(name="Mat Avanzada", credits=5, is_active=False),
        )

        assert updated.name == "Mat Avanzada"
        assert updated.credits == 5
        assert updated.is_active is False

    def test_update_subject_no_changes(self, db_session: Session) -> None:
        subject = create_subject(
            db_session,
            SubjectCreate(code="MAT101", name="Matematicas", credits=4),
        )

        updated = update_subject(db_session, subject.id, SubjectUpdate())

        assert updated.id == subject.id
        assert updated.name == "Matematicas"

    def test_deactivate_subject(self, db_session: Session) -> None:
        subject = create_subject(
            db_session,
            SubjectCreate(code="MAT101", name="Matematicas", credits=4),
        )

        deactivated = deactivate_subject(db_session, subject.id)

        assert deactivated.is_active is False
