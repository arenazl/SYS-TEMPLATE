"""SQLModel para Permiso - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class PermisoBase(SQLModel):
    nombre: str
    codigo: str
    modulo: str
    descripcion: str | None = None
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Permiso(PermisoBase, table=True):
    __tablename__ = "permisos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class PermisoCreate(PermisoBase):
    """Para crear - campos requeridos según definición"""
    pass


class PermisoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    modulo: str | None = None
    descripcion: str | None = None
    organizacion_id: int | None = None


class PermisoResponse(PermisoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
