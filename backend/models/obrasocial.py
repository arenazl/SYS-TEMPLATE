"""SQLModel para ObraSocial - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from pydantic import EmailStr

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class ObraSocialBase(SQLModel):
    nombre: str
    codigo: str
    cuit: str | None = None
    tipo: str
    telefono: str | None = None
    email: EmailStr | None = None
    direccion: str | None = None
    cobertura_porcentaje: float | None = None
    requiere_autorizacion: bool | None = None
    dias_pago: int | None = None
    activo: bool | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class ObraSocial(ObraSocialBase, table=True):
    __tablename__ = "obras_sociales"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class ObraSocialCreate(ObraSocialBase):
    """Para crear - campos requeridos según definición"""
    pass


class ObraSocialUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    codigo: str | None = None
    cuit: str | None = None
    tipo: str | None = None
    telefono: str | None = None
    email: EmailStr | None = None
    direccion: str | None = None
    cobertura_porcentaje: float | None = None
    requiere_autorizacion: bool | None = None
    dias_pago: int | None = None
    activo: bool | None = None
    observaciones: str | None = None


class ObraSocialResponse(ObraSocialBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
