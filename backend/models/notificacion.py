"""SQLModel para Notificacion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .usuario import Usuario
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class NotificacionBase(SQLModel):
    usuario_id: int = Field(foreign_key="usuarios.id")
    titulo: str
    mensaje: str | None = None
    tipo: str | None = None
    leida: bool | None = None
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Notificacion(NotificacionBase, table=True):
    __tablename__ = "notificaciones"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    usuario: Optional["Usuario"] = Relationship()
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class NotificacionCreate(NotificacionBase):
    """Para crear - campos requeridos según definición"""
    pass


class NotificacionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    usuario_id: int | None = None
    titulo: str | None = None
    mensaje: str | None = None
    tipo: str | None = None
    leida: bool | None = None
    organizacion_id: int | None = None


class NotificacionResponse(NotificacionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
