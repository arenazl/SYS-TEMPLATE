"""add_usuarios_table

Revision ID: 084775e64ae9
Revises: f2652423a7c8
Create Date: 2026-01-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '084775e64ae9'
down_revision: Union[str, None] = 'f2652423a7c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('usuarios',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('organizacion_id', sa.Integer(), sa.ForeignKey('organizaciones.id'), nullable=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('apellido', sa.String(255), nullable=False),
        sa.Column('telefono', sa.String(255), nullable=True),
        sa.Column('rol', sa.String(50), nullable=False),
        sa.Column('activo', sa.Boolean(), default=True),
    )


def downgrade() -> None:
    op.drop_table('usuarios')
