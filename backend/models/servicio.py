"""SQLModel para Servicio - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .categoriaservicio import CategoriaServicio


# ============ Base (campos compartidos) ============
class ServicioBase(SQLModel):
    nombre: str
    descripcion: str | None = None
    precio: float
    categoria_id: int = Field(foreign_key="categorias_servicio.id")
    unidad: str | None = None
    disponible_24h: bool | None = None
    horario_inicio: str | None = None
    horario_fin: str | None = None
    activo: bool | None = None
    requiere_reserva: bool | None = None


# ============ Modelo de tabla ============
class Servicio(ServicioBase, table=True):
    __tablename__ = "servicios"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    categoria: Optional["CategoriaServicio"] = Relationship()


# ============ Schemas para API ============
class ServicioCreate(ServicioBase):
    """Para crear - campos requeridos según definición"""
    pass


class ServicioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    descripcion: str | None = None
    precio: float | None = None
    categoria_id: int | None = None
    unidad: str | None = None
    disponible_24h: bool | None = None
    horario_inicio: str | None = None
    horario_fin: str | None = None
    activo: bool | None = None
    requiere_reserva: bool | None = None


class ServicioResponse(ServicioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
