"""SQLModel para Consumo - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .reserva import Reserva
    from .servicio import Servicio
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class ConsumoBase(SQLModel):
    reserva_id: int = Field(foreign_key="reservas.id")
    servicio_id: int = Field(foreign_key="servicios.id")
    empleado_id: int | None = Field(default=None, foreign_key="empleados.id")
    cantidad: int
    fecha: date
    hora: str | None = None
    precio_unitario: float
    subtotal: float
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Consumo(ConsumoBase, table=True):
    __tablename__ = "consumos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    reserva: Optional["Reserva"] = Relationship()
    servicio: Optional["Servicio"] = Relationship()
    empleado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class ConsumoCreate(ConsumoBase):
    """Para crear - campos requeridos según definición"""
    pass


class ConsumoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    reserva_id: int | None = None
    servicio_id: int | None = None
    empleado_id: int | None = None
    cantidad: int | None = None
    fecha: date | None = None
    hora: str | None = None
    precio_unitario: float | None = None
    subtotal: float | None = None
    observaciones: str | None = None


class ConsumoResponse(ConsumoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
