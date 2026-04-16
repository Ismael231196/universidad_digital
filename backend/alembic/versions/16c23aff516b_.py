"""empty message

Revision ID: 16c23aff516b
Revises: a1b2c3d4e5f6, add_teacher_id_to_grades
Create Date: 2026-04-16 15:36:49.294988

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '16c23aff516b'
down_revision: Union[str, Sequence[str], None] = ('a1b2c3d4e5f6', 'add_teacher_id_to_grades')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
