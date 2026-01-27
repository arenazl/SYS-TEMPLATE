"""
Modelo para Consultas Guardadas (Panel BI).
Permite guardar consultas frecuentes como favoritos para acceso rápido.
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime


class ConsultaGuardadaBase(SQLModel):
    """Base para consulta guardada"""
    nombre: str = Field(max_length=200, index=True)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    pregunta_original: str = Field(max_length=1000)  # La pregunta en lenguaje natural
    sql_query: Optional[str] = Field(default=None, max_length=5000)  # SQL generado (opcional)
    icono: str = Field(default="database", max_length=50)
    color: str = Field(default="#3b82f6", max_length=20)
    tipo_visualizacion: str = Field(default="tabla", max_length=50)  # tabla, cards, ranking, etc
    es_publica: bool = Field(default=False)  # Si es visible para todos del hotel


class ConsultaGuardada(ConsultaGuardadaBase, table=True):
    """Modelo de tabla para consultas guardadas"""
    __tablename__ = "consultas_guardadas"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    organizacion_id: int = Field(foreign_key="organizaciones.id", index=True)

    veces_ejecutada: int = Field(default=0)
    ultima_ejecucion: Optional[datetime] = Field(default=None)

    activo: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    # usuario: Optional["Usuario"] = Relationship(back_populates="consultas_guardadas")
    # organizacion: Optional["Organizacion"] = Relationship()


class ConsultaGuardadaCreate(ConsultaGuardadaBase):
    """Schema para crear consulta guardada"""
    pass


class ConsultaGuardadaUpdate(SQLModel):
    """Schema para actualizar consulta guardada"""
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    icono: Optional[str] = None
    color: Optional[str] = None
    tipo_visualizacion: Optional[str] = None
    es_publica: Optional[bool] = None


class ConsultaGuardadaRead(ConsultaGuardadaBase):
    """Schema para leer consulta guardada"""
    id: int
    usuario_id: int
    organizacion_id: int
    veces_ejecutada: int
    ultima_ejecucion: Optional[datetime]
    created_at: datetime
    updated_at: datetime
