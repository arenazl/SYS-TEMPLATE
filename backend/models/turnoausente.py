"""SQLModel para Turnoausente - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .turno import Turno
    from .turno import Turno
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class TurnoausenteBase(SQLModel):
    turno_id: int = Field(foreign_key="turnos.id")
    fecha: date
    motivo: str | None = None
    contactado: bool | None = None
    fecha_contacto: date | None = None
    reprogramado: bool | None = None
    nuevo_turno_id: int | None = Field(default=None, foreign_key="turnos.id")
    empleado_registro_id: int | None = Field(default=None, foreign_key="empleados.id")
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Turnoausente(TurnoausenteBase, table=True):
    __tablename__ = "turnos_ausentes"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships - especificamos foreign_keys para resolver ambigüedad
    turno: Optional["Turno"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Turnoausente.turno_id]"}
    )
    nuevo_turno: Optional["Turno"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Turnoausente.nuevo_turno_id]"}
    )
    empleado_registro: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class TurnoausenteCreate(TurnoausenteBase):
    """Para crear - campos requeridos según definición"""
    pass


class TurnoausenteUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    turno_id: int | None = None
    fecha: date | None = None
    motivo: str | None = None
    contactado: bool | None = None
    fecha_contacto: date | None = None
    reprogramado: bool | None = None
    nuevo_turno_id: int | None = None
    empleado_registro_id: int | None = None
    observaciones: str | None = None


class TurnoausenteResponse(TurnoausenteBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
