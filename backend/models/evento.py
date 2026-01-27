"""SQLModel para Evento - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from pydantic import EmailStr

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class EventoBase(SQLModel):
    nombre: str
    tipo: str
    cliente: str | None = None
    contacto: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None
    fecha: date
    hora_inicio: str
    hora_fin: str
    salon: str | None = None
    capacidad: int | None = None
    montaje: str | None = None
    servicios_incluidos: str | None = None
    precio: float
    estado: str
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Evento(EventoBase, table=True):
    __tablename__ = "eventos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class EventoCreate(EventoBase):
    """Para crear - campos requeridos según definición"""
    pass


class EventoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    tipo: str | None = None
    cliente: str | None = None
    contacto: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None
    fecha: date | None = None
    hora_inicio: str | None = None
    hora_fin: str | None = None
    salon: str | None = None
    capacidad: int | None = None
    montaje: str | None = None
    servicios_incluidos: str | None = None
    precio: float | None = None
    estado: str | None = None
    observaciones: str | None = None


class EventoResponse(EventoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
