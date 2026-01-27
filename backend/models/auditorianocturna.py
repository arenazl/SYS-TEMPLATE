"""SQLModel para AuditoriaNocturna - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class AuditoriaNocturnaBase(SQLModel):
    fecha: date
    empleado_id: int = Field(foreign_key="empleados.id")
    ocupacion_porcentaje: float | None = None
    adr: float | None = None
    revpar: float | None = None
    total_ingresos: float | None = None
    habitaciones_vendidas: int | None = None
    checkins_realizados: int | None = None
    checkouts_realizados: int | None = None
    consumos_totales: float | None = None
    observaciones: str | None = None
    estado: str
    hora_cierre: str | None = None


# ============ Modelo de tabla ============
class AuditoriaNocturna(AuditoriaNocturnaBase, table=True):
    __tablename__ = "auditorias_nocturnas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    empleado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class AuditoriaNocturnaCreate(AuditoriaNocturnaBase):
    """Para crear - campos requeridos según definición"""
    pass


class AuditoriaNocturnaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    fecha: date | None = None
    empleado_id: int | None = None
    ocupacion_porcentaje: float | None = None
    adr: float | None = None
    revpar: float | None = None
    total_ingresos: float | None = None
    habitaciones_vendidas: int | None = None
    checkins_realizados: int | None = None
    checkouts_realizados: int | None = None
    consumos_totales: float | None = None
    observaciones: str | None = None
    estado: str | None = None
    hora_cierre: str | None = None


class AuditoriaNocturnaResponse(AuditoriaNocturnaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
