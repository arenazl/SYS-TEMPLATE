"""SQLModel para CancelacionTurno - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .turno import Turno
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class CancelacionTurnoBase(SQLModel):
    turno_id: int = Field(foreign_key="turnos.id")
    fecha: date
    motivo: str
    detalle: str | None = None
    con_anticipacion: bool | None = None
    horas_anticipacion: int | None = None
    empleado_registro_id: int | None = Field(default=None, foreign_key="empleados.id")
    notificado: bool | None = None


# ============ Modelo de tabla ============
class CancelacionTurno(CancelacionTurnoBase, table=True):
    __tablename__ = "cancelaciones_turno"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    turno: Optional["Turno"] = Relationship()
    empleado_registro: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class CancelacionTurnoCreate(CancelacionTurnoBase):
    """Para crear - campos requeridos según definición"""
    pass


class CancelacionTurnoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    turno_id: int | None = None
    fecha: date | None = None
    motivo: str | None = None
    detalle: str | None = None
    con_anticipacion: bool | None = None
    horas_anticipacion: int | None = None
    empleado_registro_id: int | None = None
    notificado: bool | None = None


class CancelacionTurnoResponse(CancelacionTurnoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
