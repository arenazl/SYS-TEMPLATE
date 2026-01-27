"""SQLModel para Logauditoria - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .usuario import Usuario
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class LogauditoriaBase(SQLModel):
    usuario_id: int | None = Field(default=None, foreign_key="usuarios.id")
    accion: str
    entidad: str | None = None
    entidad_id: int | None = None
    datos_anteriores: dict | None = Field(default=None, sa_type=JSON)
    datos_nuevos: dict | None = Field(default=None, sa_type=JSON)
    ip: str | None = None
    user_agent: str | None = None
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Logauditoria(LogauditoriaBase, table=True):
    __tablename__ = "logs_auditoria"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    usuario: Optional["Usuario"] = Relationship()
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class LogauditoriaCreate(LogauditoriaBase):
    """Para crear - campos requeridos según definición"""
    pass


class LogauditoriaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    usuario_id: int | None = None
    accion: str | None = None
    entidad: str | None = None
    entidad_id: int | None = None
    datos_anteriores: dict | None = None
    datos_nuevos: dict | None = None
    ip: str | None = None
    user_agent: str | None = None
    organizacion_id: int | None = None


class LogauditoriaResponse(LogauditoriaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
