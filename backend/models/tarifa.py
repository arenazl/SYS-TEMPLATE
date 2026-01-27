"""SQLModel para Tarifa - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .tipohabitacion import TipoHabitacion
    from .temporada import Temporada


# ============ Base (campos compartidos) ============
class TarifaBase(SQLModel):
    tipo_habitacion_id: int = Field(foreign_key="tipos_habitacion.id")
    temporada_id: int = Field(foreign_key="temporadas.id")
    precio: float
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class Tarifa(TarifaBase, table=True):
    __tablename__ = "tarifas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    tipo_habitacion: Optional["TipoHabitacion"] = Relationship()
    temporada: Optional["Temporada"] = Relationship()


# ============ Schemas para API ============
class TarifaCreate(TarifaBase):
    """Para crear - campos requeridos según definición"""
    pass


class TarifaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    tipo_habitacion_id: int | None = None
    temporada_id: int | None = None
    precio: float | None = None
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None


class TarifaResponse(TarifaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
