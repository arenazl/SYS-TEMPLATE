"""Schemas Menurol - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class MenurolBase(BaseModel):
    menu_id: int
    rol_id: int
    organizacion_id: int | None = None

class MenurolCreate(MenurolBase):
    pass

class MenurolUpdate(BaseModel):
    menu_id: int | None = None
    rol_id: int | None = None
    organizacion_id: int | None = None

class MenurolResponse(MenurolBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
