"""initial_clean - Create tables for Cliente, Producto, Pedido, DetallePedido

Revision ID: f2652423a7c8
Revises:
Create Date: 2026-01-19 14:58:47.874079

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2652423a7c8'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Organizaciones (required for FK references)
    op.create_table('organizaciones',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('codigo', sa.String(255), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('activo', sa.Boolean(), default=True),
    )

    # Clientes
    op.create_table('clientes',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('organizacion_id', sa.Integer(), sa.ForeignKey('organizaciones.id'), nullable=True),
        sa.Column('codigo', sa.String(255), nullable=True),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('telefono', sa.String(255), nullable=True),
        sa.Column('direccion', sa.Text(), nullable=True),
        sa.Column('tipo', sa.String(50), nullable=True),
        sa.Column('activo', sa.Boolean(), default=True),
    )

    # Productos
    op.create_table('productos',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('organizacion_id', sa.Integer(), sa.ForeignKey('organizaciones.id'), nullable=True),
        sa.Column('codigo', sa.String(255), nullable=False),
        sa.Column('nombre', sa.String(255), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('precio', sa.Float(), nullable=False),
        sa.Column('stock', sa.Integer(), nullable=True),
        sa.Column('activo', sa.Boolean(), default=True),
    )

    # Pedidos (master)
    op.create_table('pedidos',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('organizacion_id', sa.Integer(), sa.ForeignKey('organizaciones.id'), nullable=True),
        sa.Column('numero', sa.String(255), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('cliente_id', sa.Integer(), sa.ForeignKey('clientes.id'), nullable=False),
        sa.Column('estado', sa.String(50), nullable=True),
        sa.Column('subtotal', sa.Float(), nullable=True),
        sa.Column('total', sa.Float(), nullable=True),
        sa.Column('notas', sa.Text(), nullable=True),
        sa.Column('activo', sa.Boolean(), default=True),
    )

    # DetallePedido (detail)
    op.create_table('detalles_pedido',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('organizacion_id', sa.Integer(), sa.ForeignKey('organizaciones.id'), nullable=True),
        sa.Column('pedido_id', sa.Integer(), sa.ForeignKey('pedidos.id'), nullable=False),
        sa.Column('producto_id', sa.Integer(), sa.ForeignKey('productos.id'), nullable=False),
        sa.Column('cantidad', sa.Integer(), nullable=False),
        sa.Column('precio_unitario', sa.Float(), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('detalles_pedido')
    op.drop_table('pedidos')
    op.drop_table('productos')
    op.drop_table('clientes')
    op.drop_table('organizaciones')
