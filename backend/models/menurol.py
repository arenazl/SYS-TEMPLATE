"""SQLModel para Menurol - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .menu import Menu
    from .rol import Rol
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class MenurolBase(SQLModel):
    menu_id: int = Field(foreign_key="menus.id")
    rol_id: int = Field(foreign_key="roles.id")
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Menurol(MenurolBase, table=True):
    __tablename__ = "menu_roles"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    menu: Optional["Menu"] = Relationship()
    rol: Optional["Rol"] = Relationship()
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class MenurolCreate(MenurolBase):
    """Para crear - campos requeridos según definición"""
    pass


class MenurolUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    menu_id: int | None = None
    rol_id: int | None = None
    organizacion_id: int | None = None


class MenurolResponse(MenurolBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
