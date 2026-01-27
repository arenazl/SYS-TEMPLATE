"""SQLModel para Queja - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente
    from .turno import Turno
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class QuejaBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    turno_id: int | None = Field(default=None, foreign_key="turnos.id")
    fecha: date
    categoria: str
    descripcion: str
    prioridad: str
    estado: str
    empleado_asignado_id: int | None = Field(default=None, foreign_key="empleados.id")
    fecha_resolucion: date | None = None
    accion_tomada: str | None = None
    compensacion: str | None = None


# ============ Modelo de tabla ============
class Queja(QuejaBase, table=True):
    __tablename__ = "quejas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()
    turno: Optional["Turno"] = Relationship()
    empleado_asignado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class QuejaCreate(QuejaBase):
    """Para crear - campos requeridos según definición"""
    pass


class QuejaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    turno_id: int | None = None
    fecha: date | None = None
    categoria: str | None = None
    descripcion: str | None = None
    prioridad: str | None = None
    estado: str | None = None
    empleado_asignado_id: int | None = None
    fecha_resolucion: date | None = None
    accion_tomada: str | None = None
    compensacion: str | None = None


class QuejaResponse(QuejaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
