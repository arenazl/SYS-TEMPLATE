"""Schemas Permiso - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class PermisoBase(BaseModel):
    nombre: str
    codigo: str
    modulo: str
    descripcion: str | None = None
    organizacion_id: int | None = None

class PermisoCreate(PermisoBase):
    pass

class PermisoUpdate(BaseModel):
    nombre: str | None = None
    codigo: str | None = None
    modulo: str | None = None
    descripcion: str | None = None
    organizacion_id: int | None = None

class PermisoResponse(PermisoBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
