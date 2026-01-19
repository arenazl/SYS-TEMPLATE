"""Schemas Logauditoria - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class LogauditoriaBase(BaseModel):
    usuario_id: int | None = None
    accion: str
    entidad: str | None = None
    entidad_id: int | None = None
    datos_anteriores: dict | None = None
    datos_nuevos: dict | None = None
    ip: str | None = None
    user_agent: str | None = None
    organizacion_id: int | None = None

class LogauditoriaCreate(LogauditoriaBase):
    pass

class LogauditoriaUpdate(BaseModel):
    usuario_id: int | None = None
    accion: str | None = None
    entidad: str | None = None
    entidad_id: int | None = None
    datos_anteriores: dict | None = None
    datos_nuevos: dict | None = None
    ip: str | None = None
    user_agent: str | None = None
    organizacion_id: int | None = None

class LogauditoriaResponse(LogauditoriaBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
