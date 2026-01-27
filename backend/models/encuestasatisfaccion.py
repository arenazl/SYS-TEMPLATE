"""SQLModel para EncuestaSatisfaccion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente
    from .turno import Turno


# ============ Base (campos compartidos) ============
class EncuestaSatisfaccionBase(SQLModel):
    paciente_id: int = Field(foreign_key="pacientes.id")
    turno_id: int | None = Field(default=None, foreign_key="turnos.id")
    fecha: date
    puntuacion_general: int
    puntuacion_atencion: int | None = None
    puntuacion_tiempo_espera: int | None = None
    puntuacion_instalaciones: int | None = None
    recomendaria: bool | None = None
    comentarios: str | None = None


# ============ Modelo de tabla ============
class EncuestaSatisfaccion(EncuestaSatisfaccionBase, table=True):
    __tablename__ = "encuestas_satisfaccion"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()
    turno: Optional["Turno"] = Relationship()


# ============ Schemas para API ============
class EncuestaSatisfaccionCreate(EncuestaSatisfaccionBase):
    """Para crear - campos requeridos según definición"""
    pass


class EncuestaSatisfaccionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    paciente_id: int | None = None
    turno_id: int | None = None
    fecha: date | None = None
    puntuacion_general: int | None = None
    puntuacion_atencion: int | None = None
    puntuacion_tiempo_espera: int | None = None
    puntuacion_instalaciones: int | None = None
    recomendaria: bool | None = None
    comentarios: str | None = None


class EncuestaSatisfaccionResponse(EncuestaSatisfaccionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
