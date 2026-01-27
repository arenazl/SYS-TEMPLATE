"""API Turno - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.turno import Turno, TurnoCreate, TurnoUpdate

router = APIRouter(prefix="/turnos")

def serialize(item: Turno) -> dict:
    data = item.model_dump()
    if item.paciente:
        data["paciente"] = {
            "id": item.paciente.id,
            "nombre": item.paciente.nombre,
            "apellido": item.paciente.apellido,
            "documento": item.paciente.documento,
            "celular": item.paciente.celular
        }
    if item.medico:
        data["medico"] = {
            "id": item.medico.id,
            "nombre": item.medico.nombre,
            "apellido": item.medico.apellido,
            "duracion_turno": item.medico.duracion_turno
        }
    if item.consultorio:
        data["consultorio"] = {"id": item.consultorio.id, "numero": item.consultorio.numero}
    if item.especialidad:
        data["especialidad"] = {
            "id": item.especialidad.id,
            "nombre": item.especialidad.nombre,
            "color": getattr(item.especialidad, 'color', None)
        }
    if item.obra_social:
        data["obra_social"] = {"id": item.obra_social.id, "nombre": item.obra_social.nombre}
    return data


@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: bool | None = None,
    medico_id: int | None = None,
    paciente_id: int | None = None,
    fecha: str | None = None,
    fecha_desde: str | None = None,
    fecha_hasta: str | None = None,
    estado: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Turno).options(selectinload(Turno.paciente), selectinload(Turno.medico), selectinload(Turno.consultorio), selectinload(Turno.especialidad), selectinload(Turno.obra_social)).where(
        Turno.organizacion_id == current_user.organizacion_id
    )
    if activo is not None:
        query = query.where(Turno.activo == activo)
    if medico_id is not None:
        query = query.where(Turno.medico_id == medico_id)
    if paciente_id is not None:
        query = query.where(Turno.paciente_id == paciente_id)
    if fecha is not None:
        query = query.where(Turno.fecha == fecha)
    if fecha_desde is not None:
        query = query.where(Turno.fecha >= fecha_desde)
    if fecha_hasta is not None:
        query = query.where(Turno.fecha <= fecha_hasta)
    if estado is not None:
        query = query.where(Turno.estado == estado)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(Turno.id.desc())
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
        select(Turno).options(selectinload(Turno.paciente), selectinload(Turno.medico), selectinload(Turno.consultorio), selectinload(Turno.especialidad), selectinload(Turno.obra_social)).where(
            Turno.id == id,
            Turno.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize(item)


@router.post("")
async def crear(
    data: TurnoCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = Turno(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: TurnoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Turno).where(
            Turno.id == id,
            Turno.organizacion_id == current_user.organizacion_id
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
        select(Turno).where(
            Turno.id == id,
            Turno.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    item.activo = False
    await db.commit()
    return {"message": "Desactivado"}
