"""SQLModel para Habitacion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .tipohabitacion import TipoHabitacion


# ============ Base (campos compartidos) ============
class HabitacionBase(SQLModel):
    numero: str
    piso: int | None = None
    tipo_habitacion_id: int = Field(foreign_key="tipos_habitacion.id")
    estado: str
    activa: bool | None = None
    ultima_limpieza: date | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Habitacion(HabitacionBase, table=True):
    __tablename__ = "habitaciones"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    tipo_habitacion: Optional["TipoHabitacion"] = Relationship()


# ============ Schemas para API ============
class HabitacionCreate(HabitacionBase):
    """Para crear - campos requeridos según definición"""
    pass


class HabitacionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    numero: str | None = None
    piso: int | None = None
    tipo_habitacion_id: int | None = None
    estado: str | None = None
    activa: bool | None = None
    ultima_limpieza: date | None = None
    observaciones: str | None = None


class HabitacionResponse(HabitacionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
