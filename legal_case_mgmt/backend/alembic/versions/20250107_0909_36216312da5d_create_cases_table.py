"""create_cases_table

Revision ID: 36216312da5d
Revises: a32636ef5474
Create Date: 2025-01-07 09:09:23.705503+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '36216312da5d'
down_revision: Union[str, None] = 'a32636ef5474'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'cases',
        sa.Column('case_id', sa.Integer(), nullable=False),
        sa.Column('case_number', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('case_type', sa.String(), nullable=False),
        sa.Column('court', sa.String(), nullable=True),
        sa.Column('jurisdiction', sa.String(), nullable=True),
        sa.Column('filing_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('practice_area', sa.String(), nullable=True),
        sa.Column('statute_of_limitations', sa.Date(), nullable=True),
        sa.Column('opposing_counsel', sa.String(), nullable=True),
        sa.Column('judge', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('assigned_attorney_id', sa.Integer(), nullable=True),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('case_id')
    )
    op.create_index(op.f('ix_cases_case_id'), 'cases', ['case_id'], unique=False)
    op.create_index(op.f('ix_cases_case_number'), 'cases', ['case_number'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_cases_case_number'), table_name='cases')
    op.drop_index(op.f('ix_cases_case_id'), table_name='cases')
    op.drop_table('cases')
