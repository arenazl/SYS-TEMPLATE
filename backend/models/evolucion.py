"""SQLModel para Evolucion - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .historiaclinica import HistoriaClinica
    from .turno import Turno
    from .medico import Medico


# ============ Base (campos compartidos) ============
class EvolucionBase(SQLModel):
    historia_clinica_id: int = Field(foreign_key="historias_clinicas.id")
    turno_id: int | None = Field(default=None, foreign_key="turnos.id")
    medico_id: int = Field(foreign_key="medicos.id")
    fecha: date
    hora: str | None = None
    motivo_consulta: str
    enfermedad_actual: str | None = None
    antecedentes_relevantes: str | None = None
    examen_fisico: str | None = None
    diagnostico_presuntivo: str | None = None
    diagnostico_cie10: str | None = None
    plan_tratamiento: str | None = None
    indicaciones: str | None = None
    proxima_cita: str | None = None
    firma_digital: str | None = None
    estado: str


# ============ Modelo de tabla ============
class Evolucion(EvolucionBase, table=True):
    __tablename__ = "evoluciones"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    historia_clinica: Optional["HistoriaClinica"] = Relationship()
    turno: Optional["Turno"] = Relationship()
    medico: Optional["Medico"] = Relationship()


# ============ Schemas para API ============
class EvolucionCreate(EvolucionBase):
    """Para crear - campos requeridos según definición"""
    pass


class EvolucionUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    historia_clinica_id: int | None = None
    turno_id: int | None = None
    medico_id: int | None = None
    fecha: date | None = None
    hora: str | None = None
    motivo_consulta: str | None = None
    enfermedad_actual: str | None = None
    antecedentes_relevantes: str | None = None
    examen_fisico: str | None = None
    diagnostico_presuntivo: str | None = None
    diagnostico_cie10: str | None = None
    plan_tratamiento: str | None = None
    indicaciones: str | None = None
    proxima_cita: str | None = None
    firma_digital: str | None = None
    estado: str | None = None


class EvolucionResponse(EvolucionBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
