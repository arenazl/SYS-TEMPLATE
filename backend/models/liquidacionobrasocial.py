"""SQLModel para LiquidacionObraSocial - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .obrasocial import ObraSocial


# ============ Base (campos compartidos) ============
class LiquidacionObraSocialBase(SQLModel):
    obra_social_id: int = Field(foreign_key="obras_sociales.id")
    periodo_mes: int
    periodo_anio: int
    fecha_presentacion: date | None = None
    total_facturado: float
    cantidad_prestaciones: int
    estado: str
    fecha_respuesta: date | None = None
    monto_aceptado: float | None = None
    monto_rechazado: float | None = None
    fecha_cobro: date | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class LiquidacionObraSocial(LiquidacionObraSocialBase, table=True):
    __tablename__ = "liquidaciones_obra_social"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    obra_social: Optional["ObraSocial"] = Relationship()


# ============ Schemas para API ============
class LiquidacionObraSocialCreate(LiquidacionObraSocialBase):
    """Para crear - campos requeridos según definición"""
    pass


class LiquidacionObraSocialUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    obra_social_id: int | None = None
    periodo_mes: int | None = None
    periodo_anio: int | None = None
    fecha_presentacion: date | None = None
    total_facturado: float | None = None
    cantidad_prestaciones: int | None = None
    estado: str | None = None
    fecha_respuesta: date | None = None
    monto_aceptado: float | None = None
    monto_rechazado: float | None = None
    fecha_cobro: date | None = None
    observaciones: str | None = None


class LiquidacionObraSocialResponse(LiquidacionObraSocialBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
