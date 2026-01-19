"""Schemas Rolpermiso - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class RolpermisoBase(BaseModel):
    rol_id: int
    permiso_id: int
    organizacion_id: int | None = None

class RolpermisoCreate(RolpermisoBase):
    pass

class RolpermisoUpdate(BaseModel):
    rol_id: int | None = None
    permiso_id: int | None = None
    organizacion_id: int | None = None

class RolpermisoResponse(RolpermisoBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
