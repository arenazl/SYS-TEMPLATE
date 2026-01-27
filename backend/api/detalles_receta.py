"""API DetalleReceta - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.detallereceta import DetalleReceta, DetalleRecetaCreate, DetalleRecetaUpdate

router = APIRouter(prefix="/detalles_receta")

def serialize(item: DetalleReceta) -> dict:
    data = item.model_dump()
    if item.receta:
        data["receta"] = {"id": item.receta.id, "diagnostico": item.receta.diagnostico}
    if item.medicamento:
        data["medicamento"] = {"id": item.medicamento.id, "nombre_comercial": item.medicamento.nombre_comercial}
    return data


@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    receta_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(DetalleReceta).options(selectinload(DetalleReceta.receta), selectinload(DetalleReceta.medicamento)).where(
        DetalleReceta.organizacion_id == current_user.organizacion_id
    )
    if receta_id is not None:
        query = query.where(DetalleReceta.receta_id == receta_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(DetalleReceta.id.desc())
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
        select(DetalleReceta).options(selectinload(DetalleReceta.receta), selectinload(DetalleReceta.medicamento)).where(
            DetalleReceta.id == id,
            DetalleReceta.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize(item)


@router.post("")
async def crear(
    data: DetalleRecetaCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = DetalleReceta(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: DetalleRecetaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(DetalleReceta).where(
            DetalleReceta.id == id,
            DetalleReceta.organizacion_id == current_user.organizacion_id
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
        select(DetalleReceta).where(
            DetalleReceta.id == id,
            DetalleReceta.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    await db.delete(item)
    await db.commit()
    return {"message": "Eliminado"}
