"""Schemas Parametro - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class ParametroBase(BaseModel):
    clave: str
    valor: str
    tipo: str
    descripcion: str | None = None
    editable: bool | None = None
    organizacion_id: int | None = None

class ParametroCreate(ParametroBase):
    pass

class ParametroUpdate(BaseModel):
    clave: str | None = None
    valor: str | None = None
    tipo: str | None = None
    descripcion: str | None = None
    editable: bool | None = None
    organizacion_id: int | None = None

class ParametroResponse(ParametroBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
