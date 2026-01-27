"""SQLModel para PracticaRealizada - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .evolucion import Evolucion
    from .practica import Practica
    from .medico import Medico


# ============ Base (campos compartidos) ============
class PracticaRealizadaBase(SQLModel):
    evolucion_id: int = Field(foreign_key="evoluciones.id")
    practica_id: int = Field(foreign_key="practicas.id")
    medico_id: int = Field(foreign_key="medicos.id")
    fecha: date
    cantidad: int
    precio_unitario: float | None = None
    subtotal: float | None = None
    nro_autorizacion: str | None = None
    estado: str
    observaciones: str | None = None


# ============ Modelo de tabla ============
class PracticaRealizada(PracticaRealizadaBase, table=True):
    __tablename__ = "practicas_realizadas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    evolucion: Optional["Evolucion"] = Relationship()
    practica: Optional["Practica"] = Relationship()
    medico: Optional["Medico"] = Relationship()


# ============ Schemas para API ============
class PracticaRealizadaCreate(PracticaRealizadaBase):
    """Para crear - campos requeridos según definición"""
    pass


class PracticaRealizadaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    evolucion_id: int | None = None
    practica_id: int | None = None
    medico_id: int | None = None
    fecha: date | None = None
    cantidad: int | None = None
    precio_unitario: float | None = None
    subtotal: float | None = None
    nro_autorizacion: str | None = None
    estado: str | None = None
    observaciones: str | None = None


class PracticaRealizadaResponse(PracticaRealizadaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
