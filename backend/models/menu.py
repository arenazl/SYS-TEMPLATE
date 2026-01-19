"""SQLModel para Menu - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .menu import Menu
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class MenuBase(SQLModel):
    nombre: str
    path: str
    icono: str | None = None
    orden: int | None = None
    parent_id: int | None = Field(default=None, foreign_key="menus.id")
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Menu(MenuBase, table=True):
    __tablename__ = "menus"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    parent: Optional["Menu"] = Relationship()
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class MenuCreate(MenuBase):
    """Para crear - campos requeridos según definición"""
    pass


class MenuUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    path: str | None = None
    icono: str | None = None
    orden: int | None = None
    parent_id: int | None = None
    organizacion_id: int | None = None


class MenuResponse(MenuBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
