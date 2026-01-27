"""SQLModel para Diagnostico - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class DiagnosticoBase(SQLModel):
    codigo_cie10: str
    nombre: str
    descripcion: str | None = None
    categoria: str | None = None
    capitulo: str | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class Diagnostico(DiagnosticoBase, table=True):
    __tablename__ = "diagnosticos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class DiagnosticoCreate(DiagnosticoBase):
    """Para crear - campos requeridos según definición"""
    pass


class DiagnosticoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    codigo_cie10: str | None = None
    nombre: str | None = None
    descripcion: str | None = None
    categoria: str | None = None
    capitulo: str | None = None
    activo: bool | None = None


class DiagnosticoResponse(DiagnosticoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
