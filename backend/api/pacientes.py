"""API Paciente - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.paciente import Paciente, PacienteCreate, PacienteUpdate

router = APIRouter(prefix="/pacientes")

def serialize(item: Paciente) -> dict:
    data = item.model_dump()
    if item.obra_social:
        data["obra_social"] = {"id": item.obra_social.id, "nombre": item.obra_social.nombre}
    if item.plan:
        data["plan"] = {"id": item.plan.id, "nombre": item.plan.nombre}
    return data


@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Paciente).options(selectinload(Paciente.obra_social), selectinload(Paciente.plan)).where(
        Paciente.organizacion_id == current_user.organizacion_id
    )
    if activo is not None:
        query = query.where(Paciente.activo == activo)
    if search is not None:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Paciente.nombre.ilike(search_term),
                Paciente.apellido.ilike(search_term),
                Paciente.documento.ilike(search_term)
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(Paciente.id.desc())
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
        select(Paciente).options(selectinload(Paciente.obra_social), selectinload(Paciente.plan)).where(
            Paciente.id == id,
            Paciente.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize(item)


@router.post("")
async def crear(
    data: PacienteCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = Paciente(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: PacienteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Paciente).where(
            Paciente.id == id,
            Paciente.organizacion_id == current_user.organizacion_id
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
        select(Paciente).where(
            Paciente.id == id,
            Paciente.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    item.activo = False
    await db.commit()
    return {"message": "Desactivado"}
