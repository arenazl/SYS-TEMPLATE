"""Schemas Organizacion - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class OrganizacionBase(BaseModel):
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

class OrganizacionCreate(OrganizacionBase):
    pass

class OrganizacionUpdate(BaseModel):
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
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
