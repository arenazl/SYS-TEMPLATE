"""Schemas Sesion - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class SesionBase(BaseModel):
    usuario_id: int
    token: str
    ip: str | None = None
    user_agent: str | None = None
    expires_at: datetime | None = None
    organizacion_id: int | None = None

class SesionCreate(SesionBase):
    pass

class SesionUpdate(BaseModel):
    usuario_id: int | None = None
    token: str | None = None
    ip: str | None = None
    user_agent: str | None = None
    expires_at: datetime | None = None
    organizacion_id: int | None = None

class SesionResponse(SesionBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
