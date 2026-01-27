from fastapi import APIRouter
from .auth import router as auth_router
from .ws import router as ws_router

from .articles import router as articles_router
from .events import router as events_router
from .documents import router as documents_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(ws_router, tags=["WebSocket"])

api_router.include_router(articles_router, tags=["Article"])
api_router.include_router(events_router, tags=["Event"])
api_router.include_router(documents_router, tags=["Document"])
