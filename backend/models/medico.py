"""SQLModel para Medico - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from pydantic import EmailStr

if TYPE_CHECKING:
    from .especialidad import Especialidad


# ============ Base (campos compartidos) ============
class MedicoBase(SQLModel):
    nombre: str
    apellido: str
    documento: str
    matricula_nacional: str | None = None
    matricula_provincial: str
    especialidad_id: int = Field(foreign_key="especialidades.id")
    email: EmailStr
    telefono: str | None = None
    celular: str | None = None
    direccion: str | None = None
    fecha_nacimiento: date | None = None
    fecha_ingreso: date
    honorarios_consulta: float | None = None
    duracion_turno: int
    atiende_particular: bool | None = None
    activo: bool | None = None
    firma_digital: str | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Medico(MedicoBase, table=True):
    __tablename__ = "medicos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    especialidad: Optional["Especialidad"] = Relationship()


# ============ Schemas para API ============
class MedicoCreate(MedicoBase):
    """Para crear - campos requeridos según definición"""
    pass


class MedicoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    apellido: str | None = None
    documento: str | None = None
    matricula_nacional: str | None = None
    matricula_provincial: str | None = None
    especialidad_id: int | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    celular: str | None = None
    direccion: str | None = None
    fecha_nacimiento: date | None = None
    fecha_ingreso: date | None = None
    honorarios_consulta: float | None = None
    duracion_turno: int | None = None
    atiende_particular: bool | None = None
    activo: bool | None = None
    firma_digital: str | None = None
    observaciones: str | None = None


class MedicoResponse(MedicoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
