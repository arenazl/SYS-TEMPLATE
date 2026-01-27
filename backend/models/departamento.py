"""SQLModel para Departamento - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class DepartamentoBase(SQLModel):
    nombre: str
    codigo: str
    descripcion: str | None = None
    responsable: str | None = None
    activo: bool | None = None


# ============ Modelo de tabla ============
class Departamento(DepartamentoBase, table=True):
    __tablename__ = "departamentos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class DepartamentoCreate(DepartamentoBase):
    """Para crear - campos requeridos según definición"""
    pass


class DepartamentoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    descripcion: str | None = None
    responsable: str | None = None
    activo: bool | None = None


class DepartamentoResponse(DepartamentoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
