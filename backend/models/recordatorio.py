"""SQLModel para Recordatorio - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente
    from .turno import Turno


# ============ Base (campos compartidos) ============
class RecordatorioBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    turno_id: int | None = Field(default=None, foreign_key="turnos.id")
    tipo: str
    fecha_envio: date
    canal: str
    mensaje: str | None = None
    estado: str
    respuesta: str | None = None


# ============ Modelo de tabla ============
class Recordatorio(RecordatorioBase, table=True):
    __tablename__ = "recordatorios"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()
    turno: Optional["Turno"] = Relationship()


# ============ Schemas para API ============
class RecordatorioCreate(RecordatorioBase):
    """Para crear - campos requeridos según definición"""
    pass


class RecordatorioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    turno_id: int | None = None
    tipo: str | None = None
    fecha_envio: date | None = None
    canal: str | None = None
    mensaje: str | None = None
    estado: str | None = None
    respuesta: str | None = None


class RecordatorioResponse(RecordatorioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
