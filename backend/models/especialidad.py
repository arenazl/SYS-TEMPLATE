"""SQLModel para Especialidad - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class EspecialidadBase(SQLModel):
    nombre: str
    codigo: str
    descripcion: str | None = None
    duracion_turno_default: int
    color: str | None = None
    icono: str | None = None
    activo: bool | None = None
    orden: int | None = None


# ============ Modelo de tabla ============
class Especialidad(EspecialidadBase, table=True):
    __tablename__ = "especialidades"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class EspecialidadCreate(EspecialidadBase):
    """Para crear - campos requeridos según definición"""
    pass


class EspecialidadUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    duracion_turno_default: int | None = None
    color: str | None = None
    icono: str | None = None
    activo: bool | None = None
    orden: int | None = None


class EspecialidadResponse(EspecialidadBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
