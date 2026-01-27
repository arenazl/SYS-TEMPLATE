"""SQLModel para Proveedor - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from pydantic import EmailStr

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class ProveedorBase(SQLModel):
    razon_social: str
    cuit: str | None = None
    rubro: str | None = None
    contacto: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    direccion: str | None = None
    activo: bool | None = None
    calificacion: int | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Proveedor(ProveedorBase, table=True):
    __tablename__ = "proveedores"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class ProveedorCreate(ProveedorBase):
    """Para crear - campos requeridos según definición"""
    pass


class ProveedorUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    razon_social: str | None = None
    cuit: str | None = None
    rubro: str | None = None
    contacto: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    direccion: str | None = None
    activo: bool | None = None
    calificacion: int | None = None
    observaciones: str | None = None


class ProveedorResponse(ProveedorBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
