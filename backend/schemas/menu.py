"""Schemas Menu - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class MenuBase(BaseModel):
    nombre: str
    path: str
    icono: str | None = None
    orden: int | None = None
    parent_id: int | None = None
    organizacion_id: int | None = None

class MenuCreate(MenuBase):
    pass

class MenuUpdate(BaseModel):
    nombre: str | None = None
    path: str | None = None
    icono: str | None = None
    orden: int | None = None
    parent_id: int | None = None
    organizacion_id: int | None = None

class MenuResponse(MenuBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
