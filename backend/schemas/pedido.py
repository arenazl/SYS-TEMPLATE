"""Schemas Pedido"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class PedidoBase(BaseModel):
    numero: str
    fecha: date
    fecha_entrega: date | None = None
    cliente_id: int
    estado: str
    subtotal: float | None = None
    descuento: float | None = None
    total: float | None = None
    notas: str | None = None

class PedidoCreate(PedidoBase):
    pass

class PedidoUpdate(BaseModel):
    numero: str | None = None
    fecha: date | None = None
    fecha_entrega: date | None = None
    cliente_id: int | None = None
    estado: str | None = None
    subtotal: float | None = None
    descuento: float | None = None
    total: float | None = None
    notas: str | None = None

class PedidoResponse(PedidoBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
