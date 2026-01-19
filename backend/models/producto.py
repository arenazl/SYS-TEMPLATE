"""SQLModel para Producto - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class ProductoBase(SQLModel):
    codigo: str
    nombre: str
    descripcion: str | None = None
    precio: float
    stock: int | None = None


# ============ Modelo de tabla ============
class Producto(ProductoBase, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class ProductoCreate(ProductoBase):
    """Para crear - campos requeridos según definición"""
    pass


class ProductoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    codigo: str | None = None
    nombre: str | None = None
    descripcion: str | None = None
    precio: float | None = None
    stock: int | None = None


class ProductoResponse(ProductoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
