"""SQLModel para Mantenimiento - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .habitacion import Habitacion
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class MantenimientoBase(SQLModel):
    habitacion_id: int = Field(foreign_key="habitaciones.id")
    empleado_id: int | None = Field(default=None, foreign_key="empleados.id")
    tipo: str
    descripcion: str
    fecha_reporte: date
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    estado: str
    prioridad: str
    costo: float | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Mantenimiento(MantenimientoBase, table=True):
    __tablename__ = "mantenimientos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    habitacion: Optional["Habitacion"] = Relationship()
    empleado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class MantenimientoCreate(MantenimientoBase):
    """Para crear - campos requeridos según definición"""
    pass


class MantenimientoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    habitacion_id: int | None = None
    empleado_id: int | None = None
    tipo: str | None = None
    descripcion: str | None = None
    fecha_reporte: date | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    estado: str | None = None
    prioridad: str | None = None
    costo: float | None = None
    observaciones: str | None = None


class MantenimientoResponse(MantenimientoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
