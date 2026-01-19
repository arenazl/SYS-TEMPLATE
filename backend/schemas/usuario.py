"""Schemas Usuario - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class UsuarioBase(BaseModel):
    email: EmailStr
    password_hash: str
    nombre: str
    apellido: str
    telefono: str | None = None
    rol: str
    organizacion_id: int | None = None

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    email: EmailStr | None = None
    password_hash: str | None = None
    nombre: str | None = None
    apellido: str | None = None
    telefono: str | None = None
    rol: str | None = None
    organizacion_id: int | None = None

class UsuarioResponse(UsuarioBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
