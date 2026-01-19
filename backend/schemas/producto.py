"""Schemas Producto"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class ProductoBase(BaseModel):
    codigo: str | None = None
    nombre: str
    descripcion: str | None = None
    precio: float
    costo: float | None = None
    stock: int | None = None
    stock_minimo: int | None = None
    categoria_id: int | None = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    codigo: str | None = None
    nombre: str | None = None
    descripcion: str | None = None
    precio: float | None = None
    costo: float | None = None
    stock: int | None = None
    stock_minimo: int | None = None
    categoria_id: int | None = None

class ProductoResponse(ProductoBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
