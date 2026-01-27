"""SQLModel para HistoriaClinica - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente


# ============ Base (campos compartidos) ============
class HistoriaClinicaBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    numero: str
    fecha_apertura: date
    estado: str
    ubicacion_fisica: str | None = None
    digitalizada: bool | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class HistoriaClinica(HistoriaClinicaBase, table=True):
    __tablename__ = "historias_clinicas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()


# ============ Schemas para API ============
class HistoriaClinicaCreate(HistoriaClinicaBase):
    """Para crear - campos requeridos según definición"""
    pass


class HistoriaClinicaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    numero: str | None = None
    fecha_apertura: date | None = None
    estado: str | None = None
    ubicacion_fisica: str | None = None
    digitalizada: bool | None = None
    observaciones: str | None = None


class HistoriaClinicaResponse(HistoriaClinicaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
