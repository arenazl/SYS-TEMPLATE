"""API Sesion - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.sesion import Sesion, SesionCreate, SesionUpdate

router = APIRouter(prefix="/sesiones")

def serialize(item: Sesion) -> dict:
    data = item.model_dump()
    if item.usuario:
        data["usuario"] = {"id": item.usuario.id, "nombre": item.usuario.nombre}
    if item.organizacion:
        data["organizacion"] = {"id": item.organizacion.id, "nombre": item.organizacion.nombre}
    return data


@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Sesion).options(selectinload(Sesion.usuario), selectinload(Sesion.organizacion)).where(
        Sesion.organizacion_id == current_user.organizacion_id
    )
    if activo is not None:
        query = query.where(Sesion.activo == activo)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(Sesion.id.desc())
    result = await db.execute(query)
    items = result.scalars().all()

    return {"items": [serialize(item) for item in items], "total": total}


@router.get("/{id}")
async def obtener(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Sesion).options(selectinload(Sesion.usuario), selectinload(Sesion.organizacion)).where(
            Sesion.id == id,
            Sesion.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize(item)


@router.post("")
async def crear(
    data: SesionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = Sesion(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: SesionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Sesion).where(
            Sesion.id == id,
            Sesion.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Actualizado"}


@router.delete("/{id}")
async def eliminar(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Sesion).where(
            Sesion.id == id,
            Sesion.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    item.activo = False
    await db.commit()
    return {"message": "Desactivado"}
