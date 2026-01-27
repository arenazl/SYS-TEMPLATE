"""SQLModel para Inventario - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .proveedor import Proveedor


# ============ Base (campos compartidos) ============
class InventarioBase(SQLModel):
    nombre: str
    codigo: str | None = None
    categoria: str
    unidad: str
    stock_actual: int
    stock_minimo: int | None = None
    proveedor_id: int | None = Field(default=None, foreign_key="proveedores.id")
    costo_unitario: float | None = None
    ubicacion: str | None = None


# ============ Modelo de tabla ============
class Inventario(InventarioBase, table=True):
    __tablename__ = "inventario"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    proveedor: Optional["Proveedor"] = Relationship()


# ============ Schemas para API ============
class InventarioCreate(InventarioBase):
    """Para crear - campos requeridos según definición"""
    pass


class InventarioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    categoria: str | None = None
    unidad: str | None = None
    stock_actual: int | None = None
    stock_minimo: int | None = None
    proveedor_id: int | None = None
    costo_unitario: float | None = None
    ubicacion: str | None = None


class InventarioResponse(InventarioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
