"""SQLModel para AgendaMedico - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .medico import Medico
    from .consultorio import Consultorio


# ============ Base (campos compartidos) ============
class AgendaMedicoBase(SQLModel):
    medico_id: int = Field(foreign_key="medicos.id")
    consultorio_id: int = Field(foreign_key="consultorios.id")
    dia_semana: str
    hora_inicio: str
    hora_fin: str
    intervalo_minutos: int
    sobreturnos_max: int | None = None
    fecha_desde: date | None = None
    fecha_hasta: date | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class AgendaMedico(AgendaMedicoBase, table=True):
    __tablename__ = "agendas_medico"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    medico: Optional["Medico"] = Relationship()
    consultorio: Optional["Consultorio"] = Relationship()


# ============ Schemas para API ============
class AgendaMedicoCreate(AgendaMedicoBase):
    """Para crear - campos requeridos según definición"""
    pass


class AgendaMedicoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    medico_id: int | None = None
    consultorio_id: int | None = None
    dia_semana: str | None = None
    hora_inicio: str | None = None
    hora_fin: str | None = None
    intervalo_minutos: int | None = None
    sobreturnos_max: int | None = None
    fecha_desde: date | None = None
    fecha_hasta: date | None = None
    activo: bool | None = None


class AgendaMedicoResponse(AgendaMedicoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
