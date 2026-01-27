"""SQLModel para Empleado - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from pydantic import EmailStr

if TYPE_CHECKING:
    from .departamento import Departamento


# ============ Base (campos compartidos) ============
class EmpleadoBase(SQLModel):
    nombre: str
    apellido: str
    documento: str
    email: EmailStr | None = None
    telefono: str | None = None
    departamento_id: int = Field(foreign_key="departamentos.id")
    cargo: str
    fecha_ingreso: date
    salario: float | None = None
    activo: bool | None = None
    turno: str | None = None


# ============ Modelo de tabla ============
class Empleado(EmpleadoBase, table=True):
    __tablename__ = "empleados"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    departamento: Optional["Departamento"] = Relationship()


# ============ Schemas para API ============
class EmpleadoCreate(EmpleadoBase):
    """Para crear - campos requeridos según definición"""
    pass


class EmpleadoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre: str | None = None
    apellido: str | None = None
    documento: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    departamento_id: int | None = None
    cargo: str | None = None
    fecha_ingreso: date | None = None
    salario: float | None = None
    activo: bool | None = None
    turno: str | None = None


class EmpleadoResponse(EmpleadoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
