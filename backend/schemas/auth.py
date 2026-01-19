"""Schemas de autenticación - Manual (no generado)"""
from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    apellido: str
    telefono: str | None = None
    organizacion_id: int | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    nombre: str
    apellido: str
    telefono: str | None = None
    rol: str
    organizacion_id: int | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
