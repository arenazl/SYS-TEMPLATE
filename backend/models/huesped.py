"""SQLModel para Huesped - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from pydantic import EmailStr

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class HuespedBase(SQLModel):
    nombre: str
    apellido: str
    tipo_documento: str
    documento: str
    nacionalidad: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    celular: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    pais: str | None = None
    fecha_nacimiento: date | None = None
    empresa: str | None = None
    vip: bool | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Huesped(HuespedBase, table=True):
    __tablename__ = "huespedes"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class HuespedCreate(HuespedBase):
    """Para crear - campos requeridos según definición"""
    pass


class HuespedUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    apellido: str | None = None
    tipo_documento: str | None = None
    documento: str | None = None
    nacionalidad: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    celular: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    pais: str | None = None
    fecha_nacimiento: date | None = None
    empresa: str | None = None
    vip: bool | None = None
    observaciones: str | None = None


class HuespedResponse(HuespedBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
