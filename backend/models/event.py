"""Modelo Event"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(Date, nullable=False)
    start_time = Column(DateTime, nullable=True)
    location = Column(String(255), nullable=True)
    capacity = Column(Integer, nullable=True)
    image = Column(String(255), nullable=True)
    event_type = Column(String(50), nullable=True)
    status = Column(String(50), nullable=False)

    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    organizacion = relationship("Organizacion")

