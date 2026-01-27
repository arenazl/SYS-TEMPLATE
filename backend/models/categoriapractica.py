"""SQLModel para CategoriaPractica - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class CategoriaPracticaBase(SQLModel):
    nombre: str
    codigo: str | None = None
    descripcion: str | None = None
    icono: str | None = None


# ============ Modelo de tabla ============
class CategoriaPractica(CategoriaPracticaBase, table=True):
    __tablename__ = "categorias_practica"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class CategoriaPracticaCreate(CategoriaPracticaBase):
    """Para crear - campos requeridos según definición"""
    pass


class CategoriaPracticaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    icono: str | None = None


class CategoriaPracticaResponse(CategoriaPracticaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
