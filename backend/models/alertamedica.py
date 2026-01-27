"""SQLModel para AlertaMedica - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente


# ============ Base (campos compartidos) ============
class AlertaMedicaBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    tipo: str
    descripcion: str
    severidad: str
    activo: bool | None = None
    fecha_registro: date | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class AlertaMedica(AlertaMedicaBase, table=True):
    __tablename__ = "alertas_medicas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()


# ============ Schemas para API ============
class AlertaMedicaCreate(AlertaMedicaBase):
    """Para crear - campos requeridos según definición"""
    pass


class AlertaMedicaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    tipo: str | None = None
    descripcion: str | None = None
    severidad: str | None = None
    activo: bool | None = None
    fecha_registro: date | None = None
    observaciones: str | None = None


class AlertaMedicaResponse(AlertaMedicaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
