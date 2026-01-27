"""SQLModel para ConsentimientoFirmado - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    from .consentimiento import Consentimiento
    from .paciente import Paciente
    from .medico import Medico


# ============ Base (campos compartidos) ============
class ConsentimientoFirmadoBase(SQLModel):
    consentimiento_id: int = Field(foreign_key="consentimientos.id")
    paciente_id: int = Field(foreign_key="pacientes.id")
    medico_id: int | None = Field(default=None, foreign_key="medicos.id")
    fecha_firma: date
    firma_paciente: str | None = None
    firma_testigo: str | None = None
    nombre_testigo: str | None = None
    documento_testigo: str | None = None
    revocado: bool | None = None
    fecha_revocacion: date | None = None
    motivo_revocacion: str | None = None


# ============ Modelo de tabla ============
class ConsentimientoFirmado(ConsentimientoFirmadoBase, table=True):
    __tablename__ = "consentimientos_firmados"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)

    # Relationships
    consentimiento: Optional["Consentimiento"] = Relationship()
    paciente: Optional["Paciente"] = Relationship()
    medico: Optional["Medico"] = Relationship()


# ============ Schemas para API ============
class ConsentimientoFirmadoCreate(ConsentimientoFirmadoBase):
    """Para crear - campos requeridos según definición"""
    pass


class ConsentimientoFirmadoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    consentimiento_id: int | None = None
    paciente_id: int | None = None
    medico_id: int | None = None
    fecha_firma: date | None = None
    firma_paciente: str | None = None
    firma_testigo: str | None = None
    nombre_testigo: str | None = None
    documento_testigo: str | None = None
    revocado: bool | None = None
    fecha_revocacion: date | None = None
    motivo_revocacion: str | None = None


class ConsentimientoFirmadoResponse(ConsentimientoFirmadoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
