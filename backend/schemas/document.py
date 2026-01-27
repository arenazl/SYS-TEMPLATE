"""Schemas Document"""
from pydantic import BaseModel, ConfigDict
from typing import Optional


class DocumentBase(BaseModel):
    title: str
    file_url: str | None = None
    notes: str | None = None
    created_date: date | None = None
    keywords: list[str] | None = None
    document_type: str | None = None
    access_level: str

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: str | None = None
    file_url: str | None = None
    notes: str | None = None
    created_date: date | None = None
    keywords: list[str] | None = None
    document_type: str | None = None
    access_level: str | None = None

class DocumentResponse(DocumentBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
