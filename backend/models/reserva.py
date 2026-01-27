"""SQLModel para Reserva - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .huesped import Huesped
    from .habitacion import Habitacion
    from .canalventa import CanalVenta
    from .tarifa import Tarifa


# ============ Base (campos compartidos) ============
class ReservaBase(SQLModel):
    codigo: str
    huesped_id: int = Field(foreign_key="huespedes.id")
    habitacion_id: int = Field(foreign_key="habitaciones.id")
    fecha_reserva: date
    fecha_entrada: date
    fecha_salida: date
    estado: str
    noches: int | None = None
    adultos: int
    ninos: int | None = None
    regimen: str | None = None
    precio_total: float | None = None
    descuento: float | None = None
    canal_venta_id: int | None = Field(default=None, foreign_key="canales_venta.id")
    tarifa_aplicada_id: int | None = Field(default=None, foreign_key="tarifas.id")
    deposito: float | None = None
    metodo_pago_deposito: str | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Reserva(ReservaBase, table=True):
    __tablename__ = "reservas"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    huesped: Optional["Huesped"] = Relationship()
    habitacion: Optional["Habitacion"] = Relationship()
    canal_venta: Optional["CanalVenta"] = Relationship()
    tarifa_aplicada: Optional["Tarifa"] = Relationship()


# ============ Schemas para API ============
class ReservaCreate(ReservaBase):
    """Para crear - campos requeridos según definición"""
    pass


class ReservaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    codigo: str | None = None
    huesped_id: int | None = None
    habitacion_id: int | None = None
    fecha_reserva: date | None = None
    fecha_entrada: date | None = None
    fecha_salida: date | None = None
    estado: str | None = None
    noches: int | None = None
    adultos: int | None = None
    ninos: int | None = None
    regimen: str | None = None
    precio_total: float | None = None
    descuento: float | None = None
    canal_venta_id: int | None = None
    tarifa_aplicada_id: int | None = None
    deposito: float | None = None
    metodo_pago_deposito: str | None = None
    observaciones: str | None = None


class ReservaResponse(ReservaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
