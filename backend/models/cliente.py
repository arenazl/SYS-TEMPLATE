"""SQLModel para Cliente - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from pydantic import EmailStr

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class ClienteBase(SQLModel):
    codigo: str | None = None
    nombre: str
    email: EmailStr | None = None
    telefono: str | None = None
    direccion: str | None = None
    tipo: str | None = None


# ============ Modelo de tabla ============
class Cliente(ClienteBase, table=True):
    __tablename__ = "clientes"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class ClienteCreate(ClienteBase):
    """Para crear - campos requeridos según definición"""
    pass


class ClienteUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    codigo: str | None = None
    nombre: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    direccion: str | None = None
    tipo: str | None = None


class ClienteResponse(ClienteBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
