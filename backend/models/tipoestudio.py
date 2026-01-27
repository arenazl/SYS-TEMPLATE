"""SQLModel para TipoEstudio - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .categoriaestudio import CategoriaEstudio


# ============ Base (campos compartidos) ============
class TipoEstudioBase(SQLModel):
    nombre: str
    codigo: str
    categoria_id: int = Field(foreign_key="categorias_estudio.id")
    codigo_nomenclador: str | None = None
    preparacion: str | None = None
    duracion_estimada: int | None = None
    precio_particular: float | None = None
    requiere_autorizacion: bool | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class TipoEstudio(TipoEstudioBase, table=True):
    __tablename__ = "tipos_estudio"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    categoria: Optional["CategoriaEstudio"] = Relationship()


# ============ Schemas para API ============
class TipoEstudioCreate(TipoEstudioBase):
    """Para crear - campos requeridos según definición"""
    pass


class TipoEstudioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    categoria_id: int | None = None
    codigo_nomenclador: str | None = None
    preparacion: str | None = None
    duracion_estimada: int | None = None
    precio_particular: float | None = None
    requiere_autorizacion: bool | None = None
    activo: bool | None = None


class TipoEstudioResponse(TipoEstudioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
