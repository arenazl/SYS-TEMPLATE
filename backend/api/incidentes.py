"""API Incidente - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.incidente import Incidente, IncidenteCreate, IncidenteUpdate

router = APIRouter(prefix="/incidentes")

def serialize(item: Incidente) -> dict:
    data = item.model_dump()
    if item.empleado_reporta:
        data["empleado_reporta"] = {"id": item.empleado_reporta.id, "nombre": item.empleado_reporta.nombre}
    if item.empleado_responsable:
        data["empleado_responsable"] = {"id": item.empleado_responsable.id, "nombre": item.empleado_responsable.nombre}
    if item.paciente:
        data["paciente"] = {"id": item.paciente.id, "nombre": item.paciente.nombre}
    return data


@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Incidente).options(selectinload(Incidente.empleado_reporta), selectinload(Incidente.empleado_responsable), selectinload(Incidente.paciente)).where(
        Incidente.organizacion_id == current_user.organizacion_id
    )
    if activo is not None:
        query = query.where(Incidente.activo == activo)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(Incidente.id.desc())
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
        select(Incidente).options(selectinload(Incidente.empleado_reporta), selectinload(Incidente.empleado_responsable), selectinload(Incidente.paciente)).where(
            Incidente.id == id,
            Incidente.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize(item)


@router.post("")
async def crear(
    data: IncidenteCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = Incidente(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: IncidenteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Incidente).where(
            Incidente.id == id,
            Incidente.organizacion_id == current_user.organizacion_id
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
        select(Incidente).where(
            Incidente.id == id,
            Incidente.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    item.activo = False
    await db.commit()
    return {"message": "Desactivado"}
