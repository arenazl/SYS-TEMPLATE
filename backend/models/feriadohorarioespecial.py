"""SQLModel para FeriadoHorarioEspecial - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class FeriadoHorarioEspecialBase(SQLModel):
    fecha: date
    nombre: str
    tipo: str
    cerrado: bool | None = None
    hora_inicio: str | None = None
    hora_fin: str | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class FeriadoHorarioEspecial(FeriadoHorarioEspecialBase, table=True):
    __tablename__ = "feriados_horarios_especiales"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class FeriadoHorarioEspecialCreate(FeriadoHorarioEspecialBase):
    """Para crear - campos requeridos según definición"""
    pass


class FeriadoHorarioEspecialUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    fecha: date | None = None
    nombre: str | None = None
    tipo: str | None = None
    cerrado: bool | None = None
    hora_inicio: str | None = None
    hora_fin: str | None = None
    observaciones: str | None = None


class FeriadoHorarioEspecialResponse(FeriadoHorarioEspecialBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
