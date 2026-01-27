"""SQLModel para Turno - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente
    from .medico import Medico
    from .consultorio import Consultorio
    from .especialidad import Especialidad
    from .obrasocial import ObraSocial


# ============ Base (campos compartidos) ============
class TurnoBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    medico_id: int = Field(foreign_key="medicos.id")
    consultorio_id: int | None = Field(default=None, foreign_key="consultorios.id")
    especialidad_id: int = Field(foreign_key="especialidades.id")
    fecha: date
    hora: str
    duracion_minutos: int | None = None
    estado: str
    tipo: str
    motivo_consulta: str | None = None
    obra_social_id: int | None = Field(default=None, foreign_key="obras_sociales.id")
    nro_autorizacion: str | None = None
    es_sobreturno: bool | None = None
    fecha_reserva: date | None = None
    canal_reserva: str
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Turno(TurnoBase, table=True):
    __tablename__ = "turnos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()
    medico: Optional["Medico"] = Relationship()
    consultorio: Optional["Consultorio"] = Relationship()
    especialidad: Optional["Especialidad"] = Relationship()
    obra_social: Optional["ObraSocial"] = Relationship()


# ============ Schemas para API ============
class TurnoCreate(TurnoBase):
    """Para crear - campos requeridos según definición"""
    pass


class TurnoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    medico_id: int | None = None
    consultorio_id: int | None = None
    especialidad_id: int | None = None
    fecha: date | None = None
    hora: str | None = None
    duracion_minutos: int | None = None
    estado: str | None = None
    tipo: str | None = None
    motivo_consulta: str | None = None
    obra_social_id: int | None = None
    nro_autorizacion: str | None = None
    es_sobreturno: bool | None = None
    fecha_reserva: date | None = None
    canal_reserva: str | None = None
    observaciones: str | None = None


class TurnoResponse(TurnoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
