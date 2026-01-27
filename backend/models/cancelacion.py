"""SQLModel para Cancelacion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .reserva import Reserva
    from .empleado import Empleado
    from .canalventa import CanalVenta


# ============ Base (campos compartidos) ============
class CancelacionBase(SQLModel):
    reserva_id: int = Field(foreign_key="reservas.id")
    fecha: date
    motivo: str
    detalle: str | None = None
    cargo_penalidad: float | None = None
    reembolso: float | None = None
    empleado_registro_id: int | None = Field(default=None, foreign_key="empleados.id")
    canal_id: int | None = Field(default=None, foreign_key="canales_venta.id")


# ============ Modelo de tabla ============
class Cancelacion(CancelacionBase, table=True):
    __tablename__ = "cancelaciones"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    reserva: Optional["Reserva"] = Relationship()
    empleado_registro: Optional["Empleado"] = Relationship()
    canal: Optional["CanalVenta"] = Relationship()


# ============ Schemas para API ============
class CancelacionCreate(CancelacionBase):
    """Para crear - campos requeridos según definición"""
    pass


class CancelacionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    reserva_id: int | None = None
    fecha: date | None = None
    motivo: str | None = None
    detalle: str | None = None
    cargo_penalidad: float | None = None
    reembolso: float | None = None
    empleado_registro_id: int | None = None
    canal_id: int | None = None


class CancelacionResponse(CancelacionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
