"""Schemas Article"""
from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Optional


class ArticleBase(BaseModel):
    title: str
    slug: str
    published_date: date
    content: str
    featured_image: str | None = None
    tags: list[str] | None = None
    status: str
    views: int | None = None
    featured: bool | None = None

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    published_date: date | None = None
    content: str | None = None
    featured_image: str | None = None
    tags: list[str] | None = None
    status: str | None = None
    views: int | None = None
    featured: bool | None = None

class ArticleResponse(ArticleBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
