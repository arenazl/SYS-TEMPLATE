"""SQLModel para DiagnosticoPaciente - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente
    from .evolucion import Evolucion
    from .diagnostico import Diagnostico
    from .medico import Medico


# ============ Base (campos compartidos) ============
class DiagnosticoPacienteBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    evolucion_id: int | None = Field(default=None, foreign_key="evoluciones.id")
    diagnostico_id: int = Field(foreign_key="diagnosticos.id")
    medico_id: int = Field(foreign_key="medicos.id")
    fecha_diagnostico: date
    tipo: str
    estado: str
    fecha_resolucion: date | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class DiagnosticoPaciente(DiagnosticoPacienteBase, table=True):
    __tablename__ = "diagnosticos_paciente"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()
    evolucion: Optional["Evolucion"] = Relationship()
    diagnostico: Optional["Diagnostico"] = Relationship()
    medico: Optional["Medico"] = Relationship()


# ============ Schemas para API ============
class DiagnosticoPacienteCreate(DiagnosticoPacienteBase):
    """Para crear - campos requeridos según definición"""
    pass


class DiagnosticoPacienteUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    evolucion_id: int | None = None
    diagnostico_id: int | None = None
    medico_id: int | None = None
    fecha_diagnostico: date | None = None
    tipo: str | None = None
    estado: str | None = None
    fecha_resolucion: date | None = None
    observaciones: str | None = None


class DiagnosticoPacienteResponse(DiagnosticoPacienteBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
