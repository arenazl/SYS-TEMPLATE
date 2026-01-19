"""SQLModel para Organizacion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from pydantic import EmailStr

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class OrganizacionBase(SQLModel):
    nombre: str
    codigo: str
    descripcion: str | None = None
    logo_url: str | None = None
    color_primario: str | None = None
    color_secundario: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None
    sitio_web: str | None = None


# ============ Modelo de tabla ============
class Organizacion(OrganizacionBase, table=True):
    __tablename__ = "organizaciones"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class OrganizacionCreate(OrganizacionBase):
    """Para crear - campos requeridos según definición"""
    pass


class OrganizacionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    logo_url: str | None = None
    color_primario: str | None = None
    color_secundario: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None
    sitio_web: str | None = None


class OrganizacionResponse(OrganizacionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
