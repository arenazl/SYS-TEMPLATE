"""SQLModel para TareaLimpieza - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .habitacion import Habitacion
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class TareaLimpiezaBase(SQLModel):
    habitacion_id: int = Field(foreign_key="habitaciones.id")
    empleado_id: int | None = Field(default=None, foreign_key="empleados.id")
    fecha: date
    hora_inicio: str | None = None
    hora_fin: str | None = None
    estado: str
    tipo: str | None = None
    observaciones: str | None = None
    calificacion: int | None = None


# ============ Modelo de tabla ============
class TareaLimpieza(TareaLimpiezaBase, table=True):
    __tablename__ = "tareas_limpieza"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    habitacion: Optional["Habitacion"] = Relationship()
    empleado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class TareaLimpiezaCreate(TareaLimpiezaBase):
    """Para crear - campos requeridos según definición"""
    pass


class TareaLimpiezaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    habitacion_id: int | None = None
    empleado_id: int | None = None
    fecha: date | None = None
    hora_inicio: str | None = None
    hora_fin: str | None = None
    estado: str | None = None
    tipo: str | None = None
    observaciones: str | None = None
    calificacion: int | None = None


class TareaLimpiezaResponse(TareaLimpiezaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
