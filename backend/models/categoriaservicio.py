"""SQLModel para CategoriaServicio - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class CategoriaServicioBase(SQLModel):
    nombre: str
    descripcion: str | None = None
    icono: str | None = None


# ============ Modelo de tabla ============
class CategoriaServicio(CategoriaServicioBase, table=True):
    __tablename__ = "categorias_servicio"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class CategoriaServicioCreate(CategoriaServicioBase):
    """Para crear - campos requeridos según definición"""
    pass


class CategoriaServicioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    descripcion: str | None = None
    icono: str | None = None


class CategoriaServicioResponse(CategoriaServicioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
