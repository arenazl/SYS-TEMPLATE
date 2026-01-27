"""Modelo Document"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

    title = Column(String(255), nullable=False)
    file_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_date = Column(Date, nullable=True)
    keywords = Column(JSON, nullable=True)
    document_type = Column(String(50), nullable=True)
    access_level = Column(String(50), nullable=False)

    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    organizacion = relationship("Organizacion")

