"""SQLModel para PlanObraSocial - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .obrasocial import ObraSocial


# ============ Base (campos compartidos) ============
class PlanObraSocialBase(SQLModel):
    obra_social_id: int = Field(foreign_key="obras_sociales.id")
    nombre: str
    codigo: str | None = None
    cobertura_consulta: float | None = None
    cobertura_practicas: float | None = None
    cobertura_estudios: float | None = None
    copago_consulta: float | None = None
    requiere_derivacion: bool | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class PlanObraSocial(PlanObraSocialBase, table=True):
    __tablename__ = "planes_obra_social"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    obra_social: Optional["ObraSocial"] = Relationship()


# ============ Schemas para API ============
class PlanObraSocialCreate(PlanObraSocialBase):
    """Para crear - campos requeridos según definición"""
    pass


class PlanObraSocialUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    obra_social_id: int | None = None
    nombre: str | None = None
    codigo: str | None = None
    cobertura_consulta: float | None = None
    cobertura_practicas: float | None = None
    cobertura_estudios: float | None = None
    copago_consulta: float | None = None
    requiere_derivacion: bool | None = None
    activo: bool | None = None


class PlanObraSocialResponse(PlanObraSocialBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
