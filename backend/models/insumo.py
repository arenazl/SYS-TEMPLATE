"""SQLModel para Insumo - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .categoriainsumo import CategoriaInsumo
    from .proveedor import Proveedor


# ============ Base (campos compartidos) ============
class InsumoBase(SQLModel):
    nombre: str
    codigo: str | None = None
    categoria_id: int = Field(foreign_key="categorias_insumo.id")
    unidad: str
    stock_actual: int
    stock_minimo: int | None = None
    proveedor_id: int | None = Field(default=None, foreign_key="proveedores.id")
    costo_unitario: float | None = None
    ubicacion: str | None = None
    lote: str | None = None
    fecha_vencimiento: date | None = None
    requiere_refrigeracion: bool | None = None


# ============ Modelo de tabla ============
class Insumo(InsumoBase, table=True):
    __tablename__ = "insumos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    categoria: Optional["CategoriaInsumo"] = Relationship()
    proveedor: Optional["Proveedor"] = Relationship()


# ============ Schemas para API ============
class InsumoCreate(InsumoBase):
    """Para crear - campos requeridos según definición"""
    pass


class InsumoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    categoria_id: int | None = None
    unidad: str | None = None
    stock_actual: int | None = None
    stock_minimo: int | None = None
    proveedor_id: int | None = None
    costo_unitario: float | None = None
    ubicacion: str | None = None
    lote: str | None = None
    fecha_vencimiento: date | None = None
    requiere_refrigeracion: bool | None = None


class InsumoResponse(InsumoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
