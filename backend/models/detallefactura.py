"""SQLModel para DetalleFactura - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .factura import Factura
    from .conceptofacturacion import ConceptoFacturacion
    from .evolucion import Evolucion
    from .practica import Practica


# ============ Base (campos compartidos) ============
class DetalleFacturaBase(SQLModel):
    factura_id: int = Field(foreign_key="facturas.id")
    concepto_id: int | None = Field(default=None, foreign_key="conceptos_facturacion.id")
    descripcion: str
    cantidad: int
    precio_unitario: float
    descuento: float | None = None
    subtotal: float
    evolucion_id: int | None = Field(default=None, foreign_key="evoluciones.id")
    practica_id: int | None = Field(default=None, foreign_key="practicas.id")


# ============ Modelo de tabla ============
class DetalleFactura(DetalleFacturaBase, table=True):
    __tablename__ = "detalles_factura"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")

    # Relationships
    factura: Optional["Factura"] = Relationship(back_populates="detalles")
    concepto: Optional["ConceptoFacturacion"] = Relationship()
    evolucion: Optional["Evolucion"] = Relationship()
    practica: Optional["Practica"] = Relationship()


# ============ Schemas para API ============
class DetalleFacturaCreate(DetalleFacturaBase):
    """Para crear - campos requeridos según definición"""
    pass


class DetalleFacturaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    factura_id: int | None = None
    concepto_id: int | None = None
    descripcion: str | None = None
    cantidad: int | None = None
    precio_unitario: float | None = None
    descuento: float | None = None
    subtotal: float | None = None
    evolucion_id: int | None = None
    practica_id: int | None = None


class DetalleFacturaResponse(DetalleFacturaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
