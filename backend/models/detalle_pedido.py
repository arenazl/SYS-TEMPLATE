"""Modelo DetallePedido - Detalle de items de un pedido"""
from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class DetallePedido(Base):
    __tablename__ = "detalles_pedido"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)

    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Float, nullable=False, default=1)
    precio_unitario = Column(Float, nullable=False)
    descuento = Column(Float, nullable=True, default=0)
    subtotal = Column(Float, nullable=False)

    # Relaciones
    pedido = relationship("Pedido", back_populates="detalles")
    producto = relationship("Producto", lazy="joined")
