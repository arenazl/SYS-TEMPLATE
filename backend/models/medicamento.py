"""SQLModel para Medicamento - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class MedicamentoBase(SQLModel):
    nombre_comercial: str
    nombre_generico: str
    laboratorio: str | None = None
    presentacion: str
    concentracion: str | None = None
    forma_farmaceutica: str
    via_administracion: str
    requiere_receta: bool | None = None
    refrigeracion: bool | None = None
    activo: bool | None = None
    observaciones: str | None = None


# ============ Modelo de tabla ============
class Medicamento(MedicamentoBase, table=True):
    __tablename__ = "medicamentos"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class MedicamentoCreate(MedicamentoBase):
    """Para crear - campos requeridos según definición"""
    pass


class MedicamentoUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    nombre_comercial: str | None = None
    nombre_generico: str | None = None
    laboratorio: str | None = None
    presentacion: str | None = None
    concentracion: str | None = None
    forma_farmaceutica: str | None = None
    via_administracion: str | None = None
    requiere_receta: bool | None = None
    refrigeracion: bool | None = None
    activo: bool | None = None
    observaciones: str | None = None


class MedicamentoResponse(MedicamentoBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
