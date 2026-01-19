"""Schemas Cliente"""
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class ClienteBase(BaseModel):
    codigo: str | None = None
    nombre: str
    razon_social: str | None = None
    cuit: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    provincia: str | None = None
    tipo: str | None = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    codigo: str | None = None
    nombre: str | None = None
    razon_social: str | None = None
    cuit: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    provincia: str | None = None
    tipo: str | None = None

class ClienteResponse(ClienteBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
