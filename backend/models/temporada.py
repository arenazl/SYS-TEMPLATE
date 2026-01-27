"""SQLModel para Temporada - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class TemporadaBase(SQLModel):
    nombre: str
    fecha_inicio: date
    fecha_fin: date
    tipo: str
    multiplicador: float
    descripcion: str | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class Temporada(TemporadaBase, table=True):
    __tablename__ = "temporadas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class TemporadaCreate(TemporadaBase):
    """Para crear - campos requeridos según definición"""
    pass


class TemporadaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    tipo: str | None = None
    multiplicador: float | None = None
    descripcion: str | None = None
    activo: bool | None = None


class TemporadaResponse(TemporadaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
