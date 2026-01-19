"""SQLModel para DetallePedido - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .pedido import Pedido
    from .producto import Producto


# ============ Base (campos compartidos) ============
class DetallePedidoBase(SQLModel):
    pedido_id: int = Field(foreign_key="pedidos.id")
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int
    precio_unitario: float
    subtotal: float | None = None


# ============ Modelo de tabla ============
class DetallePedido(DetallePedidoBase, table=True):
    __tablename__ = "detalles_pedido"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")

    # Relationships
    pedido: Optional["Pedido"] = Relationship(back_populates="detalles")
    producto: Optional["Producto"] = Relationship()


# ============ Schemas para API ============
class DetallePedidoCreate(DetallePedidoBase):
    """Para crear - campos requeridos según definición"""
    pass


class DetallePedidoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    pedido_id: int | None = None
    producto_id: int | None = None
    cantidad: int | None = None
    precio_unitario: float | None = None
    subtotal: float | None = None


class DetallePedidoResponse(DetallePedidoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
