"""SQLModel para MovimientoInsumo - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .insumo import Insumo
    from .empleado import Empleado


# ============ Base (campos compartidos) ============
class MovimientoInsumoBase(SQLModel):
    insumo_id: int = Field(foreign_key="insumos.id")
    tipo: str
    cantidad: int
    fecha: date
    empleado_id: int | None = Field(default=None, foreign_key="empleados.id")
    motivo: str | None = None
    destino: str | None = None
    costo_total: float | None = None


# ============ Modelo de tabla ============
class MovimientoInsumo(MovimientoInsumoBase, table=True):
    __tablename__ = "movimientos_insumo"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    insumo: Optional["Insumo"] = Relationship()
    empleado: Optional["Empleado"] = Relationship()


# ============ Schemas para API ============
class MovimientoInsumoCreate(MovimientoInsumoBase):
    """Para crear - campos requeridos según definición"""
    pass


class MovimientoInsumoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    insumo_id: int | None = None
    tipo: str | None = None
    cantidad: int | None = None
    fecha: date | None = None
    empleado_id: int | None = None
    motivo: str | None = None
    destino: str | None = None
    costo_total: float | None = None


class MovimientoInsumoResponse(MovimientoInsumoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
