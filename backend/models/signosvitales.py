"""SQLModel para SignosVitales - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .evolucion import Evolucion


# ============ Base (campos compartidos) ============
class SignosVitalesBase(SQLModel):
    evolucion_id: int = Field(foreign_key="evoluciones.id")
    fecha: date
    hora: str | None = None
    peso_kg: float | None = None
    talla_cm: float | None = None
    imc: float | None = None
    temperatura: float | None = None
    presion_sistolica: int | None = None
    presion_diastolica: int | None = None
    frecuencia_cardiaca: int | None = None
    frecuencia_respiratoria: int | None = None
    saturacion_o2: int | None = None
    glucemia: float | None = None
    observaciones: str | None = None
    registrado_por: str | None = None


# ============ Modelo de tabla ============
class SignosVitales(SignosVitalesBase, table=True):
    __tablename__ = "signos_vitales"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    evolucion: Optional["Evolucion"] = Relationship()


# ============ Schemas para API ============
class SignosVitalesCreate(SignosVitalesBase):
    """Para crear - campos requeridos según definición"""
    pass


class SignosVitalesUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    evolucion_id: int | None = None
    fecha: date | None = None
    hora: str | None = None
    peso_kg: float | None = None
    talla_cm: float | None = None
    imc: float | None = None
    temperatura: float | None = None
    presion_sistolica: int | None = None
    presion_diastolica: int | None = None
    frecuencia_cardiaca: int | None = None
    frecuencia_respiratoria: int | None = None
    saturacion_o2: int | None = None
    glucemia: float | None = None
    observaciones: str | None = None
    registrado_por: str | None = None


class SignosVitalesResponse(SignosVitalesBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
