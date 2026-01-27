"""SQLModel para Consentimiento - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class ConsentimientoBase(SQLModel):
    nombre: str
    tipo: str
    contenido: str
    version: str | None = None
    activo: bool | None = None
    obligatorio: bool | None = None


# ============ Modelo de tabla ============
class Consentimiento(ConsentimientoBase, table=True):
    __tablename__ = "consentimientos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class ConsentimientoCreate(ConsentimientoBase):
    """Para crear - campos requeridos según definición"""
    pass


class ConsentimientoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    tipo: str | None = None
    contenido: str | None = None
    version: str | None = None
    activo: bool | None = None
    obligatorio: bool | None = None


class ConsentimientoResponse(ConsentimientoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
