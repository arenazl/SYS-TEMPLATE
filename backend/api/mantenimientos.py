"""API Mantenimiento - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.mantenimiento import Mantenimiento, MantenimientoCreate, MantenimientoUpdate

router = APIRouter(prefix="/mantenimientos")

def serialize(item: Mantenimiento) -> dict:
    data = item.model_dump()
    if item.habitacion:
        data["habitacion"] = {"id": item.habitacion.id, "numero": item.habitacion.numero}
    if item.empleado:
        data["empleado"] = {"id": item.empleado.id, "nombre": item.empleado.nombre}
    return data


@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Mantenimiento).options(selectinload(Mantenimiento.habitacion), selectinload(Mantenimiento.empleado)).where(
        Mantenimiento.organizacion_id == current_user.organizacion_id
    )
    if activo is not None:
        query = query.where(Mantenimiento.activo == activo)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(Mantenimiento.id.desc())
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
        select(Mantenimiento).options(selectinload(Mantenimiento.habitacion), selectinload(Mantenimiento.empleado)).where(
            Mantenimiento.id == id,
            Mantenimiento.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize(item)


@router.post("")
async def crear(
    data: MantenimientoCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = Mantenimiento(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: MantenimientoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Mantenimiento).where(
            Mantenimiento.id == id,
            Mantenimiento.organizacion_id == current_user.organizacion_id
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
        select(Mantenimiento).where(
            Mantenimiento.id == id,
            Mantenimiento.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    item.activo = False
    await db.commit()
    return {"message": "Desactivado"}
