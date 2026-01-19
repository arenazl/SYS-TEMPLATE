"""SQLModel para Rol - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class RolBase(SQLModel):
    nombre: str
    codigo: str
    descripcion: str | None = None
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Rol(RolBase, table=True):
    __tablename__ = "roles"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class RolCreate(RolBase):
    """Para crear - campos requeridos según definición"""
    pass


class RolUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    organizacion_id: int | None = None


class RolResponse(RolBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
