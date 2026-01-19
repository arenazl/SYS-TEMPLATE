"""Schemas Notificacion - Generado automáticamente"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class NotificacionBase(BaseModel):
    usuario_id: int
    titulo: str
    mensaje: str | None = None
    tipo: str | None = None
    leida: bool | None = None
    organizacion_id: int | None = None

class NotificacionCreate(NotificacionBase):
    pass

class NotificacionUpdate(BaseModel):
    usuario_id: int | None = None
    titulo: str | None = None
    mensaje: str | None = None
    tipo: str | None = None
    leida: bool | None = None
    organizacion_id: int | None = None

class NotificacionResponse(NotificacionBase):
    id: int
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)
