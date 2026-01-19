from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from core.database import get_db
from core.security import verify_password, get_password_hash, create_access_token, get_current_user
from core.config import settings
from models.usuario import Usuario
from schemas.auth import UserCreate, UserResponse, Token

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Registrar nuevo usuario"""
    # Verificar si el email ya existe
    result = await db.execute(select(Usuario).where(Usuario.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Crear usuario
    user = Usuario(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        nombre=user_data.nombre,
        apellido=user_data.apellido,
        telefono=user_data.telefono,
        organizacion_id=user_data.organizacion_id,
        rol="usuario"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Login con email y password"""
    # DEBUG
    print(f"[DEBUG] Login attempt: username={form_data.username}, password={form_data.password}")

    # Buscar usuario por email
    result = await db.execute(select(Usuario).where(Usuario.email == form_data.username))
    user = result.scalar_one_or_none()

    print(f"[DEBUG] User found: {user is not None}")
    if user:
        print(f"[DEBUG] Checking password...")
        is_valid = verify_password(form_data.password, user.password_hash)
        print(f"[DEBUG] Password valid: {is_valid}")

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.activo:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    # Crear token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    """Obtener usuario actual"""
    return current_user


@router.get("/check-email")
async def check_email(email: str, db: AsyncSession = Depends(get_db)):
    """Verificar si un email ya está registrado"""
    result = await db.execute(select(Usuario).where(Usuario.email == email))
    user = result.scalar_one_or_none()
    return {"exists": user is not None}
