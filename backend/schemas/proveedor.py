"""Schemas Proveedor"""
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class ProveedorBase(BaseModel):
    codigo: str | None = None
    nombre: str
    razon_social: str | None = None
    cuit: str | None = None
    contacto: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None
    direccion: str | None = None
    notas: str | None = None

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    codigo: str | None = None
    nombre: str | None = None
    razon_social: str | None = None
    cuit: str | None = None
    contacto: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None
    direccion: str | None = None
    notas: str | None = None

class ProveedorResponse(ProveedorBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
