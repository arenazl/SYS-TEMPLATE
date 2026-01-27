"""SQLModel para Pago - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .factura import Factura
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class PagoBase(SQLModel):
    factura_id: int = Field(foreign_key="facturas.id")
    fecha: date
    monto: float
    metodo: str
    comprobante: str | None = None
    estado: str
    empleado_id: int | None = Field(default=None, foreign_key="empleados.id")
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Pago(PagoBase, table=True):
    __tablename__ = "pagos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    factura: Optional["Factura"] = Relationship()
    empleado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class PagoCreate(PagoBase):
    """Para crear - campos requeridos según definición"""
    pass


class PagoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    factura_id: int | None = None
    fecha: date | None = None
    monto: float | None = None
    metodo: str | None = None
    comprobante: str | None = None
    estado: str | None = None
    empleado_id: int | None = None
    observaciones: str | None = None


class PagoResponse(PagoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
