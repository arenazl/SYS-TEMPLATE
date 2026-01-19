"""Schemas Rol - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class RolBase(BaseModel):
    nombre: str
    codigo: str
    descripcion: str | None = None
    organizacion_id: int | None = None

class RolCreate(RolBase):
    pass

class RolUpdate(BaseModel):
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    organizacion_id: int | None = None

class RolResponse(RolBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
