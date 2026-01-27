"""SQLModel para DetalleReceta - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .receta import Receta
    from .medicamento import Medicamento


# ============ Base (campos compartidos) ============
class DetalleRecetaBase(SQLModel):
    receta_id: int = Field(foreign_key="recetas.id")
    medicamento_id: int = Field(foreign_key="medicamentos.id")
    dosis: str
    frecuencia: str
    duracion: str
    cantidad: int | None = None
    via_administracion: str | None = None
    indicaciones: str | None = None


# ============ Modelo de tabla ============
class DetalleReceta(DetalleRecetaBase, table=True):
    __tablename__ = "detalles_receta"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")

    # Relationships
    receta: Optional["Receta"] = Relationship(back_populates="detalles")
    medicamento: Optional["Medicamento"] = Relationship()


# ============ Schemas para API ============
class DetalleRecetaCreate(DetalleRecetaBase):
    """Para crear - campos requeridos según definición"""
    pass


class DetalleRecetaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    receta_id: int | None = None
    medicamento_id: int | None = None
    dosis: str | None = None
    frecuencia: str | None = None
    duracion: str | None = None
    cantidad: int | None = None
    via_administracion: str | None = None
    indicaciones: str | None = None


class DetalleRecetaResponse(DetalleRecetaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
