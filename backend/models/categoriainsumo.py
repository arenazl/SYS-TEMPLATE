"""SQLModel para CategoriaInsumo - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class CategoriaInsumoBase(SQLModel):
    nombre: str
    descripcion: str | None = None


# ============ Modelo de tabla ============
class CategoriaInsumo(CategoriaInsumoBase, table=True):
    __tablename__ = "categorias_insumo"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class CategoriaInsumoCreate(CategoriaInsumoBase):
    """Para crear - campos requeridos según definición"""
    pass


class CategoriaInsumoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    descripcion: str | None = None


class CategoriaInsumoResponse(CategoriaInsumoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
