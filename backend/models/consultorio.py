"""SQLModel para Consultorio - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .especialidad import Especialidad


# ============ Base (campos compartidos) ============
class ConsultorioBase(SQLModel):
    numero: str
    piso: int | None = None
    sector: str | None = None
    especialidad_id: int | None = Field(default=None, foreign_key="especialidades.id")
    estado: str
    equipamiento: str | None = None
    activo: bool | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Consultorio(ConsultorioBase, table=True):
    __tablename__ = "consultorios"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    especialidad: Optional["Especialidad"] = Relationship()


# ============ Schemas para API ============
class ConsultorioCreate(ConsultorioBase):
    """Para crear - campos requeridos según definición"""
    pass


class ConsultorioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    numero: str | None = None
    piso: int | None = None
    sector: str | None = None
    especialidad_id: int | None = None
    estado: str | None = None
    equipamiento: str | None = None
    activo: bool | None = None
    observaciones: str | None = None


class ConsultorioResponse(ConsultorioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
