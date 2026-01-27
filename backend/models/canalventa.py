"""SQLModel para CanalVenta - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from pydantic import EmailStr

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class CanalVentaBase(SQLModel):
    nombre: str
    codigo: str
    tipo: str
    comision_porcentaje: float | None = None
    contacto: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    activo: bool | None = None
    api_key: str | None = None
    ultimo_sync: date | None = None


# ============ Modelo de tabla ============
class CanalVenta(CanalVentaBase, table=True):
    __tablename__ = "canales_venta"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class CanalVentaCreate(CanalVentaBase):
    """Para crear - campos requeridos según definición"""
    pass


class CanalVentaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    tipo: str | None = None
    comision_porcentaje: float | None = None
    contacto: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    activo: bool | None = None
    api_key: str | None = None
    ultimo_sync: date | None = None


class CanalVentaResponse(CanalVentaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
