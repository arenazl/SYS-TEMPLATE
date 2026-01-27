"""SQLModel para Factura - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .paciente import Paciente
    from .obrasocial import ObraSocial


# ============ Base (campos compartidos) ============
class FacturaBase(SQLModel):
    numero: str
    paciente_id: int = Field(foreign_key="pacientes.id")
    obra_social_id: int | None = Field(default=None, foreign_key="obras_sociales.id")
    fecha: date
    tipo_comprobante: str
    subtotal: float | None = None
    impuestos: float | None = None
    descuento: float | None = None
    total: float
    estado: str
    fecha_vencimiento: date | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Factura(FacturaBase, table=True):
    __tablename__ = "facturas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    paciente: Optional["Paciente"] = Relationship()
    obra_social: Optional["ObraSocial"] = Relationship()
    detalles: List["DetalleFactura"] = Relationship(back_populates="factura")


# ============ Schemas para API ============
class FacturaCreate(FacturaBase):
    """Para crear - campos requeridos según definición"""
    pass


class FacturaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    numero: str | None = None
    paciente_id: int | None = None
    obra_social_id: int | None = None
    fecha: date | None = None
    tipo_comprobante: str | None = None
    subtotal: float | None = None
    impuestos: float | None = None
    descuento: float | None = None
    total: float | None = None
    estado: str | None = None
    fecha_vencimiento: date | None = None
    observaciones: str | None = None


class FacturaResponse(FacturaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
