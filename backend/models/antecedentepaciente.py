"""SQLModel para AntecedentePaciente - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente


# ============ Base (campos compartidos) ============
class AntecedentePacienteBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    tipo: str
    descripcion: str
    fecha_desde: date | None = None
    gravedad: str | None = None
    activo: bool | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class AntecedentePaciente(AntecedentePacienteBase, table=True):
    __tablename__ = "antecedentes_paciente"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()


# ============ Schemas para API ============
class AntecedentePacienteCreate(AntecedentePacienteBase):
    """Para crear - campos requeridos según definición"""
    pass


class AntecedentePacienteUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    tipo: str | None = None
    descripcion: str | None = None
    fecha_desde: date | None = None
    gravedad: str | None = None
    activo: bool | None = None
    observaciones: str | None = None


class AntecedentePacienteResponse(AntecedentePacienteBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
