"""SQLModel para Receta - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .evolucion import Evolucion
    from .paciente import Paciente
    from .medico import Medico


# ============ Base (campos compartidos) ============
class RecetaBase(SQLModel):
    evolucion_id: int = Field(foreign_key="evoluciones.id")
    paciente_id: int = Field(foreign_key="pacientes.id")
    medico_id: int = Field(foreign_key="medicos.id")
    fecha: date
    tipo: str
    diagnostico: str | None = None
    estado: str
    fecha_vencimiento: date | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Receta(RecetaBase, table=True):
    __tablename__ = "recetas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    evolucion: Optional["Evolucion"] = Relationship()
    paciente: Optional["Paciente"] = Relationship()
    medico: Optional["Medico"] = Relationship()
    detalles: List["DetalleReceta"] = Relationship(back_populates="receta")


# ============ Schemas para API ============
class RecetaCreate(RecetaBase):
    """Para crear - campos requeridos según definición"""
    pass


class RecetaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    evolucion_id: int | None = None
    paciente_id: int | None = None
    medico_id: int | None = None
    fecha: date | None = None
    tipo: str | None = None
    diagnostico: str | None = None
    estado: str | None = None
    fecha_vencimiento: date | None = None
    observaciones: str | None = None


class RecetaResponse(RecetaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
