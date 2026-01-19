"""SQLModel para Pedido - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .cliente import Cliente


# ============ Base (campos compartidos) ============
class PedidoBase(SQLModel):
    numero: str
    fecha: date
    cliente_id: int = Field(foreign_key="clientes.id")
    estado: str | None = None
    subtotal: float | None = None
    total: float | None = None
    notas: str | None = None


# ============ Modelo de tabla ============
class Pedido(PedidoBase, table=True):
    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    cliente: Optional["Cliente"] = Relationship()
    detalles: List["DetallePedido"] = Relationship(back_populates="pedido")


# ============ Schemas para API ============
class PedidoCreate(PedidoBase):
    """Para crear - campos requeridos según definición"""
    pass


class PedidoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    numero: str | None = None
    fecha: date | None = None
    cliente_id: int | None = None
    estado: str | None = None
    subtotal: float | None = None
    total: float | None = None
    notas: str | None = None


class PedidoResponse(PedidoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
