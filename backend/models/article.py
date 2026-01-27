"""Modelo Article"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    published_date = Column(Date, nullable=False)
    content = Column(Text, nullable=False)
    featured_image = Column(String(255), nullable=True)
    tags = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False)
    views = Column(Integer, nullable=True)
    featured = Column(Boolean, nullable=True)

    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    organizacion = relationship("Organizacion")

