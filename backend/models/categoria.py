"""SQLModel para Categoria - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class CategoriaBase(SQLModel):
    nombre: str
    descripcion: str | None = None
    color: str | None = None


# ============ Modelo de tabla ============
class Categoria(CategoriaBase, table=True):
    __tablename__ = "categorias"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class CategoriaCreate(CategoriaBase):
    """Para crear - campos requeridos según definición"""
    pass


class CategoriaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    descripcion: str | None = None
    color: str | None = None


class CategoriaResponse(CategoriaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
