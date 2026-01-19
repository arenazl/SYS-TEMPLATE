"""Schemas Categoria"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    color: str | None = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    color: str | None = None

class CategoriaResponse(CategoriaBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
