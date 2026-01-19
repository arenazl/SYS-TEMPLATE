"""SQLModel para Sesion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .usuario import Usuario
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class SesionBase(SQLModel):
    usuario_id: int = Field(foreign_key="usuarios.id")
    token: str
    ip: str | None = None
    user_agent: str | None = None
    expires_at: datetime | None = None
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Sesion(SesionBase, table=True):
    __tablename__ = "sesiones"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    usuario: Optional["Usuario"] = Relationship()
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class SesionCreate(SesionBase):
    """Para crear - campos requeridos según definición"""
    pass


class SesionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    usuario_id: int | None = None
    token: str | None = None
    ip: str | None = None
    user_agent: str | None = None
    expires_at: datetime | None = None
    organizacion_id: int | None = None


class SesionResponse(SesionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
