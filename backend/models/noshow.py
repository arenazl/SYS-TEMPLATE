"""SQLModel para NoShow - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .reserva import Reserva
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class NoShowBase(SQLModel):
    reserva_id: int = Field(foreign_key="reservas.id")
    fecha: date
    motivo: str | None = None
    cargo_penalidad: float | None = None
    porcentaje_cargo: float | None = None
    empleado_registro_id: int | None = Field(default=None, foreign_key="empleados.id")
    observaciones: str | None = None


# ============ Modelo de tabla ============
class NoShow(NoShowBase, table=True):
    __tablename__ = "noshows"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    reserva: Optional["Reserva"] = Relationship()
    empleado_registro: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class NoShowCreate(NoShowBase):
    """Para crear - campos requeridos según definición"""
    pass


class NoShowUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    reserva_id: int | None = None
    fecha: date | None = None
    motivo: str | None = None
    cargo_penalidad: float | None = None
    porcentaje_cargo: float | None = None
    empleado_registro_id: int | None = None
    observaciones: str | None = None


class NoShowResponse(NoShowBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
