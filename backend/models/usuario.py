"""SQLModel para Usuario - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from pydantic import EmailStr

if TYPE_CHECKING:
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class UsuarioBase(SQLModel):
    email: EmailStr
    password_hash: str
    nombre: str
    apellido: str
    telefono: str | None = None
    rol: str
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Usuario(UsuarioBase, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class UsuarioCreate(UsuarioBase):
    """Para crear - campos requeridos según definición"""
    pass


class UsuarioUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    email: EmailStr | None = None
    password_hash: str | None = None
    nombre: str | None = None
    apellido: str | None = None
    telefono: str | None = None
    rol: str | None = None
    organizacion_id: int | None = None


class UsuarioResponse(UsuarioBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
