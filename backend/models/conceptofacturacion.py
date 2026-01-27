"""SQLModel para ConceptoFacturacion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class ConceptoFacturacionBase(SQLModel):
    nombre: str
    codigo: str | None = None
    tipo: str
    precio_default: float | None = None
    impuesto_porcentaje: float | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class ConceptoFacturacion(ConceptoFacturacionBase, table=True):
    __tablename__ = "conceptos_facturacion"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class ConceptoFacturacionCreate(ConceptoFacturacionBase):
    """Para crear - campos requeridos según definición"""
    pass


class ConceptoFacturacionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    tipo: str | None = None
    precio_default: float | None = None
    impuesto_porcentaje: float | None = None
    activo: bool | None = None


class ConceptoFacturacionResponse(ConceptoFacturacionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
