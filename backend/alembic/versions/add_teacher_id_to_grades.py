"""
Revision ID: add_teacher_id_to_grades
Revises: 
Create Date: 2026-04-16
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('grades', sa.Column('teacher_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_grades_teacher_id_users', 'grades', 'users', ['teacher_id'], ['id'])

def downgrade():
    op.drop_constraint('fk_grades_teacher_id_users', 'grades', type_='foreignkey')
    op.drop_column('grades', 'teacher_id')
