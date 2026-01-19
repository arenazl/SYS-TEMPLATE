"""SQLModel para Movimiento - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .producto import Producto


# ============ Base (campos compartidos) ============
class MovimientoBase(SQLModel):
    fecha: datetime
    tipo: str
    producto_id: int = Field(foreign_key="productos.id")
    cantidad: int
    stock_anterior: int | None = None
    stock_posterior: int | None = None
    motivo: str | None = None
    referencia: str | None = None


# ============ Modelo de tabla ============
class Movimiento(MovimientoBase, table=True):
    __tablename__ = "movimientos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    producto: Optional["Producto"] = Relationship()


# ============ Schemas para API ============
class MovimientoCreate(MovimientoBase):
    """Para crear - campos requeridos según definición"""
    pass


class MovimientoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    fecha: datetime | None = None
    tipo: str | None = None
    producto_id: int | None = None
    cantidad: int | None = None
    stock_anterior: int | None = None
    stock_posterior: int | None = None
    motivo: str | None = None
    referencia: str | None = None


class MovimientoResponse(MovimientoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
