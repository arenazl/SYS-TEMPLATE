"""SQLModel para ConfiguracionClinica - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class ConfiguracionClinicaBase(SQLModel):
    clave: str
    valor: str
    tipo: str
    descripcion: str | None = None
    categoria: str | None = None
    modificable: bool | None = None


# ============ Modelo de tabla ============
class ConfiguracionClinica(ConfiguracionClinicaBase, table=True):
    __tablename__ = "configuraciones_clinica"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class ConfiguracionClinicaCreate(ConfiguracionClinicaBase):
    """Para crear - campos requeridos según definición"""
    pass


class ConfiguracionClinicaUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    clave: str | None = None
    valor: str | None = None
    tipo: str | None = None
    descripcion: str | None = None
    categoria: str | None = None
    modificable: bool | None = None


class ConfiguracionClinicaResponse(ConfiguracionClinicaBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
