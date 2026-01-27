"""Schemas Event"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class EventBase(BaseModel):
    name: str
    description: str | None = None
    event_date: date
    start_time: datetime | None = None
    location: str | None = None
    capacity: int | None = None
    image: str | None = None
    event_type: str | None = None
    status: str

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    event_date: date | None = None
    start_time: datetime | None = None
    location: str | None = None
    capacity: int | None = None
    image: str | None = None
    event_type: str | None = None
    status: str | None = None

class EventResponse(EventBase):
    id: int
    organizacion_id: int | None = None
    activo: bool
    model_config = ConfigDict(from_attributes=True)
