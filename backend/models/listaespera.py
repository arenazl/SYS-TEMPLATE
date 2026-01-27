"""SQLModel para ListaEspera - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente
    from .medico import Medico
    from .especialidad import Especialidad


# ============ Base (campos compartidos) ============
class ListaEsperaBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    medico_id: int | None = Field(default=None, foreign_key="medicos.id")
    especialidad_id: int = Field(foreign_key="especialidades.id")
    fecha_solicitud: date
    urgencia: str
    horario_preferido: str | None = None
    dias_preferidos: str | None = None
    contactado: bool | None = None
    fecha_contacto: date | None = None
    estado: str
    observaciones: str | None = None


# ============ Modelo de tabla ============
class ListaEspera(ListaEsperaBase, table=True):
    __tablename__ = "lista_espera"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()
    medico: Optional["Medico"] = Relationship()
    especialidad: Optional["Especialidad"] = Relationship()


# ============ Schemas para API ============
class ListaEsperaCreate(ListaEsperaBase):
    """Para crear - campos requeridos según definición"""
    pass


class ListaEsperaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    medico_id: int | None = None
    especialidad_id: int | None = None
    fecha_solicitud: date | None = None
    urgencia: str | None = None
    horario_preferido: str | None = None
    dias_preferidos: str | None = None
    contactado: bool | None = None
    fecha_contacto: date | None = None
    estado: str | None = None
    observaciones: str | None = None


class ListaEsperaResponse(ListaEsperaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
