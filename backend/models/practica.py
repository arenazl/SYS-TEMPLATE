"""SQLModel para Practica - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .categoriapractica import CategoriaPractica


# ============ Base (campos compartidos) ============
class PracticaBase(SQLModel):
    nombre: str
    codigo_nomenclador: str
    descripcion: str | None = None
    categoria_id: int = Field(foreign_key="categorias_practica.id")
    precio_particular: float
    duracion_minutos: int | None = None
    requiere_turno: bool | None = None
    requiere_autorizacion: bool | None = None
    preparacion: str | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class Practica(PracticaBase, table=True):
    __tablename__ = "practicas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    categoria: Optional["CategoriaPractica"] = Relationship()


# ============ Schemas para API ============
class PracticaCreate(PracticaBase):
    """Para crear - campos requeridos según definición"""
    pass


class PracticaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo_nomenclador: str | None = None
    descripcion: str | None = None
    categoria_id: int | None = None
    precio_particular: float | None = None
    duracion_minutos: int | None = None
    requiere_turno: bool | None = None
    requiere_autorizacion: bool | None = None
    preparacion: str | None = None
    activo: bool | None = None


class PracticaResponse(PracticaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
