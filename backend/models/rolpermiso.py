"""SQLModel para Rolpermiso - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .rol import Rol
    from .permiso import Permiso
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class RolpermisoBase(SQLModel):
    rol_id: int = Field(foreign_key="roles.id")
    permiso_id: int = Field(foreign_key="permisos.id")
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Rolpermiso(RolpermisoBase, table=True):
    __tablename__ = "rol_permisos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    rol: Optional["Rol"] = Relationship()
    permiso: Optional["Permiso"] = Relationship()
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class RolpermisoCreate(RolpermisoBase):
    """Para crear - campos requeridos según definición"""
    pass


class RolpermisoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    rol_id: int | None = None
    permiso_id: int | None = None
    organizacion_id: int | None = None


class RolpermisoResponse(RolpermisoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
