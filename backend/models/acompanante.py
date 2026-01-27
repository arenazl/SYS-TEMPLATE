"""SQLModel para Acompanante - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .reserva import Reserva


# ============ Base (campos compartidos) ============
class AcompananteBase(SQLModel):
    reserva_id: int = Field(foreign_key="reservas.id")
    nombre: str
    apellido: str
    tipo_documento: str | None = None
    documento: str | None = None
    edad: int | None = None
    parentesco: str | None = None


# ============ Modelo de tabla ============
class Acompanante(AcompananteBase, table=True):
    __tablename__ = "acompanantes"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    reserva: Optional["Reserva"] = Relationship()


# ============ Schemas para API ============
class AcompananteCreate(AcompananteBase):
    """Para crear - campos requeridos según definición"""
    pass


class AcompananteUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    reserva_id: int | None = None
    nombre: str | None = None
    apellido: str | None = None
    tipo_documento: str | None = None
    documento: str | None = None
    edad: int | None = None
    parentesco: str | None = None


class AcompananteResponse(AcompananteBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
