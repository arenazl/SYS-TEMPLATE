"""Schemas Compra"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class CompraBase(BaseModel):
    numero: str
    fecha: date
    fecha_recepcion: date | None = None
    proveedor_id: int
    estado: str
    subtotal: float | None = None
    descuento: float | None = None
    total: float | None = None
    notas: str | None = None

class CompraCreate(CompraBase):
    pass

class CompraUpdate(BaseModel):
    numero: str | None = None
    fecha: date | None = None
    fecha_recepcion: date | None = None
    proveedor_id: int | None = None
    estado: str | None = None
    subtotal: float | None = None
    descuento: float | None = None
    total: float | None = None
    notas: str | None = None

class CompraResponse(CompraBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
