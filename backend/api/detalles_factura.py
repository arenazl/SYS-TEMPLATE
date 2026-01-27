"""API DetalleFactura - Generado automáticamente"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.security import get_current_user
from models.detallefactura import DetalleFactura, DetalleFacturaCreate, DetalleFacturaUpdate

router = APIRouter(prefix="/detalles_factura")

def serialize(item: DetalleFactura) -> dict:
    data = item.model_dump()
    if item.factura:
        data["factura"] = {"id": item.factura.id, "numero": item.factura.numero}
    if item.concepto:
        data["concepto"] = {"id": item.concepto.id, "nombre": item.concepto.nombre}
    if item.evolucion:
        data["evolucion"] = {"id": item.evolucion.id, "hora": item.evolucion.hora}
    if item.practica:
        data["practica"] = {"id": item.practica.id, "nombre": item.practica.nombre}
    return data


@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    factura_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(DetalleFactura).options(selectinload(DetalleFactura.factura), selectinload(DetalleFactura.concepto), selectinload(DetalleFactura.evolucion), selectinload(DetalleFactura.practica)).where(
        DetalleFactura.organizacion_id == current_user.organizacion_id
    )
    if factura_id is not None:
        query = query.where(DetalleFactura.factura_id == factura_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    query = query.offset(skip).limit(limit).order_by(DetalleFactura.id.desc())
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
        select(DetalleFactura).options(selectinload(DetalleFactura.factura), selectinload(DetalleFactura.concepto), selectinload(DetalleFactura.evolucion), selectinload(DetalleFactura.practica)).where(
            DetalleFactura.id == id,
            DetalleFactura.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return serialize(item)


@router.post("")
async def crear(
    data: DetalleFacturaCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    item = DetalleFactura(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}


@router.put("/{id}")
async def actualizar(
    id: int,
    data: DetalleFacturaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(DetalleFactura).where(
            DetalleFactura.id == id,
            DetalleFactura.organizacion_id == current_user.organizacion_id
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
        select(DetalleFactura).where(
            DetalleFactura.id == id,
            DetalleFactura.organizacion_id == current_user.organizacion_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    await db.delete(item)
    await db.commit()
    return {"message": "Eliminado"}
