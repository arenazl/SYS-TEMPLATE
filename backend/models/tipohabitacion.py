"""SQLModel para TipoHabitacion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class TipoHabitacionBase(SQLModel):
    nombre: str
    codigo: str
    descripcion: str | None = None
    capacidad: int
    precio_base: float
    amenities: str | None = None
    metros_cuadrados: int | None = None
    vista: str | None = None
    camas: str | None = None
    orden: int | None = None


# ============ Modelo de tabla ============
class TipoHabitacion(TipoHabitacionBase, table=True):
    __tablename__ = "tipos_habitacion"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class TipoHabitacionCreate(TipoHabitacionBase):
    """Para crear - campos requeridos según definición"""
    pass


class TipoHabitacionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    capacidad: int | None = None
    precio_base: float | None = None
    amenities: str | None = None
    metros_cuadrados: int | None = None
    vista: str | None = None
    camas: str | None = None
    orden: int | None = None


class TipoHabitacionResponse(TipoHabitacionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
