"""SQLModel para CategoriaEstudio - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class CategoriaEstudioBase(SQLModel):
    nombre: str
    codigo: str | None = None
    descripcion: str | None = None
    tipo: str
    icono: str | None = None
    orden: int | None = None


# ============ Modelo de tabla ============
class CategoriaEstudio(CategoriaEstudioBase, table=True):
    __tablename__ = "categorias_estudio"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class CategoriaEstudioCreate(CategoriaEstudioBase):
    """Para crear - campos requeridos según definición"""
    pass


class CategoriaEstudioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    tipo: str | None = None
    icono: str | None = None
    orden: int | None = None


class CategoriaEstudioResponse(CategoriaEstudioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
