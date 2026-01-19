"""SQLModel para Parametro - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .organizacion import Organizacion


# ============ Base (campos compartidos) ============
class ParametroBase(SQLModel):
    clave: str
    valor: str
    tipo: str
    descripcion: str | None = None
    editable: bool | None = None
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")


# ============ Modelo de tabla ============
class Parametro(ParametroBase, table=True):
    __tablename__ = "parametros"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    organizacion: Optional["Organizacion"] = Relationship()


# ============ Schemas para API ============
class ParametroCreate(ParametroBase):
    """Para crear - campos requeridos según definición"""
    pass


class ParametroUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    clave: str | None = None
    valor: str | None = None
    tipo: str | None = None
    descripcion: str | None = None
    editable: bool | None = None
    organizacion_id: int | None = None


class ParametroResponse(ParametroBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
