"""SQLModel para Incidente - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .empleado import Empleado
    from .empleado import Empleado
    from .paciente import Paciente


# ============ Base (campos compartidos) ============
class IncidenteBase(SQLModel):
    tipo: str
    fecha: date
    hora: str
    ubicacion: str | None = None
    descripcion: str
    gravedad: str
    estado: str
    empleado_reporta_id: int | None = Field(default=None, foreign_key="empleados.id")
    empleado_responsable_id: int | None = Field(default=None, foreign_key="empleados.id")
    paciente_id: int | None = Field(default=None, foreign_key="pacientes.id")
    accion_inmediata: str | None = None
    accion_correctiva: str | None = None
    autoridades_notificadas: bool | None = None
    fecha_resolucion: date | None = None


# ============ Modelo de tabla ============
class Incidente(IncidenteBase, table=True):
    __tablename__ = "incidentes"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships - especificamos foreign_keys para resolver ambigüedad
    empleado_reporta: Optional["Empleado"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Incidente.empleado_reporta_id]"}
    )
    empleado_responsable: Optional["Empleado"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Incidente.empleado_responsable_id]"}
    )
    paciente: Optional["Paciente"] = Relationship()


# ============ Schemas para API ============
class IncidenteCreate(IncidenteBase):
    """Para crear - campos requeridos según definición"""
    pass


class IncidenteUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    tipo: str | None = None
    fecha: date | None = None
    hora: str | None = None
    ubicacion: str | None = None
    descripcion: str | None = None
    gravedad: str | None = None
    estado: str | None = None
    empleado_reporta_id: int | None = None
    empleado_responsable_id: int | None = None
    paciente_id: int | None = None
    accion_inmediata: str | None = None
    accion_correctiva: str | None = None
    autoridades_notificadas: bool | None = None
    fecha_resolucion: date | None = None


class IncidenteResponse(IncidenteBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
