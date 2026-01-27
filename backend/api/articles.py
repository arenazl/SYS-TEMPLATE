"""API Article"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional


from core.database import get_db
from core.security import get_current_user
from models.article import Article
from schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse

router = APIRouter(prefix="/articles")

@router.get("")
async def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    activo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = select(Article).where(Article.organizacion_id == current_user.organizacion_id)
    if activo is not None:
        query = query.where(Article.activo == activo)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    query = query.offset(skip).limit(limit).order_by(Article.id.desc())
    result = await db.execute(query)
    items = result.unique().scalars().all()
    return {"items": items, "total": total}

@router.get("/{id}")
async def obtener(id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(select(Article).where(Article.id == id, Article.organizacion_id == current_user.organizacion_id))
    item = result.unique().scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return item

@router.post("")
async def crear(data: ArticleCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    item = Article(**data.model_dump(), organizacion_id=current_user.organizacion_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Creado"}

@router.put("/{id}")
async def actualizar(id: int, data: ArticleUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(select(Article).where(Article.id == id, Article.organizacion_id == current_user.organizacion_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "message": "Actualizado"}

@router.delete("/{id}")
async def eliminar(id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    result = await db.execute(select(Article).where(Article.id == id, Article.organizacion_id == current_user.organizacion_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    item.activo = False
    await db.commit()
    return {"message": "Article eliminado"}
