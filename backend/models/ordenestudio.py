"""SQLModel para OrdenEstudio - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .evolucion import Evolucion
    from .paciente import Paciente
    from .medico import Medico
    from .tipoestudio import TipoEstudio


# ============ Base (campos compartidos) ============
class OrdenEstudioBase(SQLModel):
    evolucion_id: int = Field(foreign_key="evoluciones.id")
    paciente_id: int = Field(foreign_key="pacientes.id")
    medico_id: int = Field(foreign_key="medicos.id")
    tipo_estudio_id: int = Field(foreign_key="tipos_estudio.id")
    fecha_orden: date
    diagnostico_presuntivo: str | None = None
    urgente: bool | None = None
    indicaciones: str | None = None
    estado: str
    fecha_realizacion: date | None = None
    resultado: str | None = None
    archivo_resultado: str | None = None
    laboratorio_externo: str | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class OrdenEstudio(OrdenEstudioBase, table=True):
    __tablename__ = "ordenes_estudio"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    evolucion: Optional["Evolucion"] = Relationship()
    paciente: Optional["Paciente"] = Relationship()
    medico: Optional["Medico"] = Relationship()
    tipo_estudio: Optional["TipoEstudio"] = Relationship()


# ============ Schemas para API ============
class OrdenEstudioCreate(OrdenEstudioBase):
    """Para crear - campos requeridos según definición"""
    pass


class OrdenEstudioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    evolucion_id: int | None = None
    paciente_id: int | None = None
    medico_id: int | None = None
    tipo_estudio_id: int | None = None
    fecha_orden: date | None = None
    diagnostico_presuntivo: str | None = None
    urgente: bool | None = None
    indicaciones: str | None = None
    estado: str | None = None
    fecha_realizacion: date | None = None
    resultado: str | None = None
    archivo_resultado: str | None = None
    laboratorio_externo: str | None = None
    observaciones: str | None = None


class OrdenEstudioResponse(OrdenEstudioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
