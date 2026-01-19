"""Schemas Movimiento"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class MovimientoBase(BaseModel):
    fecha: datetime
    tipo: str
    producto_id: int
    cantidad: int
    stock_anterior: int | None = None
    stock_posterior: int | None = None
    motivo: str | None = None
    referencia: str | None = None

class MovimientoCreate(MovimientoBase):
    pass

class MovimientoUpdate(BaseModel):
    fecha: datetime | None = None
    tipo: str | None = None
    producto_id: int | None = None
    cantidad: int | None = None
    stock_anterior: int | None = None
    stock_posterior: int | None = None
    motivo: str | None = None
    referencia: str | None = None

class MovimientoResponse(MovimientoBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
