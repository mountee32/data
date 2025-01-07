"""update_documents_table

Revision ID: 20250107_0915
Revises: e8098db7db23
Create Date: 2025-01-07 09:15:00.000000+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite


# revision identifiers, used by Alembic.
revision: str = '20250107_0915'
down_revision: Union[str, None] = 'e8098db7db23'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new documents table with updated schema
    op.create_table('documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('case_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('upload_date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('document_metadata', sqlite.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_table('documents')
