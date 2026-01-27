"""SQLModel para Paciente - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from pydantic import EmailStr

if TYPE_CHECKING:
    from .obrasocial import ObraSocial
    from .planobrasocial import PlanObraSocial


# ============ Base (campos compartidos) ============
class PacienteBase(SQLModel):
    nombre: str
    apellido: str
    tipo_documento: str
    documento: str
    fecha_nacimiento: date
    sexo: str
    estado_civil: str | None = None
    nacionalidad: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    celular: str
    direccion: str | None = None
    ciudad: str | None = None
    provincia: str | None = None
    codigo_postal: str | None = None
    obra_social_id: int | None = Field(default=None, foreign_key="obras_sociales.id")
    nro_afiliado: str | None = None
    plan_id: int | None = Field(default=None, foreign_key="planes_obra_social.id")
    grupo_sanguineo: str | None = None
    factor_rh: str | None = None
    ocupacion: str | None = None
    contacto_emergencia: str | None = None
    telefono_emergencia: str | None = None
    activo: bool | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Paciente(PacienteBase, table=True):
    __tablename__ = "pacientes"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    obra_social: Optional["ObraSocial"] = Relationship()
    plan: Optional["PlanObraSocial"] = Relationship()


# ============ Schemas para API ============
class PacienteCreate(PacienteBase):
    """Para crear - campos requeridos según definición"""
    pass


class PacienteUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    apellido: str | None = None
    tipo_documento: str | None = None
    documento: str | None = None
    fecha_nacimiento: date | None = None
    sexo: str | None = None
    estado_civil: str | None = None
    nacionalidad: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    celular: str | None = None
    direccion: str | None = None
    ciudad: str | None = None
    provincia: str | None = None
    codigo_postal: str | None = None
    obra_social_id: int | None = None
    nro_afiliado: str | None = None
    plan_id: int | None = None
    grupo_sanguineo: str | None = None
    factor_rh: str | None = None
    ocupacion: str | None = None
    contacto_emergencia: str | None = None
    telefono_emergencia: str | None = None
    activo: bool | None = None
    observaciones: str | None = None


class PacienteResponse(PacienteBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
