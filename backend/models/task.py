"""SQLModel para Task - Generado automáticamente"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date

if TYPE_CHECKING:
    pass


# ============ Base (campos compartidos) ============
class TaskBase(SQLModel):
    titulo: str
    descripcion: str | None = None
    completada: bool | None = None
    fecha_vencimiento: date | None = None


# ============ Modelo de tabla ============
class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    organizacion_id: int | None = Field(default=None, foreign_key="organizaciones.id")
    activo: bool = Field(default=True)



# ============ Schemas para API ============
class TaskCreate(TaskBase):
    """Para crear - campos requeridos según definición"""
    pass


class TaskUpdate(SQLModel):
    """Para actualizar - todos opcionales"""
    titulo: str | None = None
    descripcion: str | None = None
    completada: bool | None = None
    fecha_vencimiento: date | None = None


class TaskResponse(TaskBase):
    """Para respuesta - incluye id y activo"""
    id: int
    organizacion_id: int | None = None
    activo: bool
