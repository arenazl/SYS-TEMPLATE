"""SQLModel para AusenciaMedico - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .medico import Medico


# ============ Base (campos compartidos) ============
class AusenciaMedicoBase(SQLModel):
    medico_id: int = Field(foreign_key="medicos.id")
    fecha_desde: date
    fecha_hasta: date
    motivo: str
    descripcion: str | None = None
    reprogramar_turnos: bool | None = None
    notificar_pacientes: bool | None = None


# ============ Modelo de tabla ============
class AusenciaMedico(AusenciaMedicoBase, table=True):
    __tablename__ = "ausencias_medico"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    medico: Optional["Medico"] = Relationship()


# ============ Schemas para API ============
class AusenciaMedicoCreate(AusenciaMedicoBase):
    """Para crear - campos requeridos según definición"""
    pass


class AusenciaMedicoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    medico_id: int | None = None
    fecha_desde: date | None = None
    fecha_hasta: date | None = None
    motivo: str | None = None
    descripcion: str | None = None
    reprogramar_turnos: bool | None = None
    notificar_pacientes: bool | None = None


class AusenciaMedicoResponse(AusenciaMedicoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
