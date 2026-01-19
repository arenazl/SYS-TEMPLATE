"""API Router - Generado automáticamente"""
from fastapi import APIRouter
from .auth import router as auth_router
from .ws import router as ws_router

from .clientes import router as clientes_router
from .productos import router as productos_router
from .pedidos import router as pedidos_router
from .detalles_pedido import router as detalles_pedido_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(ws_router, tags=["WebSocket"])

api_router.include_router(clientes_router, tags=["Cliente"])
api_router.include_router(productos_router, tags=["Producto"])
api_router.include_router(pedidos_router, tags=["Pedido"])
api_router.include_router(detalles_pedido_router, tags=["DetallePedido"])
