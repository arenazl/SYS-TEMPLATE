"""API Router - Generado automáticamente"""
from fastapi import APIRouter
from .auth import router as auth_router
from .ws import router as ws_router

from .tasks import router as tasks_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(ws_router, tags=["WebSocket"])

api_router.include_router(tasks_router, tags=["Task"])
