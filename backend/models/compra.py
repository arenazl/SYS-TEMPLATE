"""SQLModel para Compra - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .proveedor import Proveedor


# ============ Base (campos compartidos) ============
class CompraBase(SQLModel):
    numero: str
    fecha: date
    fecha_recepcion: date | None = None
    proveedor_id: int = Field(foreign_key="proveedores.id")
    estado: str
    subtotal: float | None = None
    descuento: float | None = None
    total: float | None = None
    notas: str | None = None


# ============ Modelo de tabla ============
class Compra(CompraBase, table=True):
    __tablename__ = "compras"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    proveedor: Optional["Proveedor"] = Relationship()


# ============ Schemas para API ============
class CompraCreate(CompraBase):
    """Para crear - campos requeridos según definición"""
    pass


class CompraUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    numero: str | None = None
    fecha: date | None = None
    fecha_recepcion: date | None = None
    proveedor_id: int | None = None
    estado: str | None = None
    subtotal: float | None = None
    descuento: float | None = None
    total: float | None = None
    notas: str | None = None


class CompraResponse(CompraBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
