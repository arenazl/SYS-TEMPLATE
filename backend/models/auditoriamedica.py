"""SQLModel para AuditoriaMedica - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class AuditoriaMedicaBase(SQLModel):
    fecha: date
    empleado_id: int = Field(foreign_key="empleados.id")
    tipo: str
    periodo_desde: date | None = None
    periodo_hasta: date | None = None
    historias_revisadas: int | None = None
    hallazgos: str | None = None
    recomendaciones: str | None = None
    estado: str


# ============ Modelo de tabla ============
class AuditoriaMedica(AuditoriaMedicaBase, table=True):
    __tablename__ = "auditorias_medicas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    empleado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class AuditoriaMedicaCreate(AuditoriaMedicaBase):
    """Para crear - campos requeridos según definición"""
    pass


class AuditoriaMedicaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    fecha: date | None = None
    empleado_id: int | None = None
    tipo: str | None = None
    periodo_desde: date | None = None
    periodo_hasta: date | None = None
    historias_revisadas: int | None = None
    hallazgos: str | None = None
    recomendaciones: str | None = None
    estado: str | None = None


class AuditoriaMedicaResponse(AuditoriaMedicaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
