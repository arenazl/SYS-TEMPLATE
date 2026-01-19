"""Schemas DetallePedido"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class DetallePedidoBase(BaseModel):
    pedido_id: int
    producto_id: int
    cantidad: float
    precio_unitario: float
    descuento: float | None = None
    subtotal: float

class DetallePedidoCreate(DetallePedidoBase):
    pass

class DetallePedidoUpdate(BaseModel):
    pedido_id: int | None = None
    producto_id: int | None = None
    cantidad: float | None = None
    precio_unitario: float | None = None
    descuento: float | None = None
    subtotal: float | None = None

class DetallePedidoResponse(DetallePedidoBase):
    id: int
    organizacion_id: int | None = None
    model_config = ConfigDict(from_attributes=True)
