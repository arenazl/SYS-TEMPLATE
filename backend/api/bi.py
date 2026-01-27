"""
API para Business Intelligence - Análisis y reportes del hotel
"""
from fastapi import APIRouter, Depends
from sqlmodel import select, func
from datetime import datetime, timedelta
from typing import Dict, List, Any

from core.database import get_db
from core.security import get_current_user
from models import (
    Reserva, Habitacion, TipoHabitacion, Huesped,
    CanalVenta, Usuario, Organizacion
)

router = APIRouter(prefix="/bi", tags=["BI"])


@router.get("/dashboard")
async def get_dashboard_data(
    periodo: str = "month",  # month, quarter, year
    session=Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna todos los datos para el panel BI
    """
    org_id = current_user.organizacion_id

    # Calcular rango de fechas según período
    hoy = datetime.now().date()
    if periodo == "month":
        fecha_inicio = hoy.replace(day=1)
        meses = 6
    elif periodo == "quarter":
        mes_inicio = ((hoy.month - 1) // 3) * 3 + 1
        fecha_inicio = hoy.replace(month=mes_inicio, day=1)
        meses = 12
    else:  # year
        fecha_inicio = hoy.replace(month=1, day=1)
        meses = 12

    return {
        "ocupacion_mensual": await get_ocupacion_mensual(session, org_id, meses),
        "ingresos_por_mes": await get_ingresos_por_mes(session, org_id, meses),
        "reservas_por_canal": await get_reservas_por_canal(session, org_id),
        "ocupacion_por_tipo": await get_ocupacion_por_tipo(session, org_id),
        "top_huespedes": await get_top_huespedes(session, org_id),
        "kpis": await get_kpis_rapidos(session, org_id),
    }


async def get_ocupacion_mensual(session, org_id: int, meses: int = 6) -> List[Dict]:
    """
    Calcula el % de ocupación por mes
    """
    resultado = []
    hoy = datetime.now().date()

    for i in range(meses):
        # Mes a calcular
        mes_fecha = hoy - timedelta(days=30 * (meses - i - 1))
        mes_inicio = mes_fecha.replace(day=1)
        mes_fin = (mes_inicio + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        # Total de habitaciones
        total_habitaciones = (
            await session.exec(
                select(func.count(Habitacion.id))
                .where(Habitacion.organizacion_id == org_id)
                .where(Habitacion.activo == True)
            )
        ).one()

        # Días del mes
        dias_mes = (mes_fin - mes_inicio).days + 1

        # Total de reservas-día (suma de noches reservadas)
        reservas = await session.exec(
            select(Reserva)
            .where(Reserva.organizacion_id == org_id)
            .where(Reserva.fecha_entrada <= mes_fin)
            .where(Reserva.fecha_salida >= mes_inicio)
            .where(Reserva.estado.in_(["confirmada", "checkin", "checkout"]))
        )

        noches_ocupadas = 0
        for reserva in reservas:
            # Calcular noches que caen dentro del mes
            entrada = max(reserva.fecha_entrada, mes_inicio)
            salida = min(reserva.fecha_salida, mes_fin)
            if entrada < salida:
                noches_ocupadas += (salida - entrada).days

        # Capacidad total del mes
        capacidad_total = total_habitaciones * dias_mes

        # % de ocupación
        ocupacion = (noches_ocupadas / capacidad_total * 100) if capacidad_total > 0 else 0

        resultado.append({
            "label": mes_fecha.strftime("%b"),
            "value": round(ocupacion, 1)
        })

    return resultado


async def get_ingresos_por_mes(session, org_id: int, meses: int = 6) -> List[Dict]:
    """
    Suma de ingresos por mes
    """
    resultado = []
    hoy = datetime.now().date()

    for i in range(meses):
        mes_fecha = hoy - timedelta(days=30 * (meses - i - 1))
        mes_inicio = mes_fecha.replace(day=1)
        mes_fin = (mes_inicio + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        # Sumar precio_total de reservas confirmadas
        total = (
            await session.exec(
                select(func.sum(Reserva.precio_total))
                .where(Reserva.organizacion_id == org_id)
                .where(Reserva.fecha_entrada >= mes_inicio)
                .where(Reserva.fecha_entrada <= mes_fin)
                .where(Reserva.estado.in_(["confirmada", "checkin", "checkout"]))
            )
        ).one() or 0

        resultado.append({
            "label": mes_fecha.strftime("%b"),
            "value": float(total)
        })

    return resultado


async def get_reservas_por_canal(session, org_id: int) -> List[Dict]:
    """
    Distribución de reservas por canal de venta
    """
    # Últimos 3 meses
    fecha_desde = datetime.now().date() - timedelta(days=90)

    # Agrupar por canal
    query = (
        select(
            CanalVenta.nombre,
            func.count(Reserva.id).label("total")
        )
        .join(CanalVenta, Reserva.canal_venta_id == CanalVenta.id)
        .where(Reserva.organizacion_id == org_id)
        .where(Reserva.fecha_reserva >= fecha_desde)
        .group_by(CanalVenta.nombre)
        .order_by(func.count(Reserva.id).desc())
    )

    results = await session.exec(query)
    data = [(nombre, total) for nombre, total in results]

    # Calcular total
    total_reservas = sum(t for _, t in data)

    # Calcular porcentajes
    colores = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"]

    return [
        {
            "label": nombre,
            "value": round((total / total_reservas * 100) if total_reservas > 0 else 0, 1),
            "color": colores[idx % len(colores)]
        }
        for idx, (nombre, total) in enumerate(data[:6])  # Top 6
    ]


async def get_ocupacion_por_tipo(session, org_id: int) -> List[Dict]:
    """
    % de ocupación por tipo de habitación
    """
    # Últimos 30 días
    fecha_desde = datetime.now().date() - timedelta(days=30)
    fecha_hasta = datetime.now().date()

    # Tipos de habitación
    tipos = await session.exec(
        select(TipoHabitacion)
        .where(TipoHabitacion.organizacion_id == org_id)
        .where(TipoHabitacion.activo == True)
    )

    resultado = []

    for tipo in tipos:
        # Habitaciones de este tipo
        habitaciones = await session.exec(
            select(Habitacion.id)
            .where(Habitacion.tipo_habitacion_id == tipo.id)
            .where(Habitacion.activo == True)
        )
        hab_ids = [h for h in habitaciones]

        if not hab_ids:
            continue

        # Total días-habitación
        dias = (fecha_hasta - fecha_desde).days
        capacidad_total = len(hab_ids) * dias

        # Reservas de estas habitaciones
        reservas = await session.exec(
            select(Reserva)
            .where(Reserva.habitacion_id.in_(hab_ids))
            .where(Reserva.fecha_entrada <= fecha_hasta)
            .where(Reserva.fecha_salida >= fecha_desde)
            .where(Reserva.estado.in_(["confirmada", "checkin", "checkout"]))
        )

        noches_ocupadas = 0
        for reserva in reservas:
            entrada = max(reserva.fecha_entrada, fecha_desde)
            salida = min(reserva.fecha_salida, fecha_hasta)
            if entrada < salida:
                noches_ocupadas += (salida - entrada).days

        ocupacion = (noches_ocupadas / capacidad_total * 100) if capacidad_total > 0 else 0

        resultado.append({
            "label": tipo.nombre,
            "value": round(ocupacion, 1)
        })

    return resultado


async def get_top_huespedes(session, org_id: int, limit: int = 5) -> List[Dict]:
    """
    Top huéspedes por cantidad de reservas
    """
    # Últimos 6 meses
    fecha_desde = datetime.now().date() - timedelta(days=180)

    query = (
        select(
            Huesped.nombre,
            Huesped.apellido,
            func.count(Reserva.id).label("total_reservas")
        )
        .join(Huesped, Reserva.huesped_id == Huesped.id)
        .where(Reserva.organizacion_id == org_id)
        .where(Reserva.fecha_reserva >= fecha_desde)
        .group_by(Huesped.id, Huesped.nombre, Huesped.apellido)
        .order_by(func.count(Reserva.id).desc())
        .limit(limit)
    )

    results = await session.exec(query)

    return [
        {
            "label": f"{nombre} {apellido}",
            "value": total
        }
        for nombre, apellido, total in results
    ]


async def get_kpis_rapidos(session, org_id: int) -> Dict[str, Any]:
    """
    KPIs rápidos para el header
    """
    hoy = datetime.now().date()
    mes_inicio = hoy.replace(day=1)
    mes_anterior_inicio = (mes_inicio - timedelta(days=1)).replace(day=1)
    mes_anterior_fin = mes_inicio - timedelta(days=1)

    # Ocupación promedio mes actual
    ocupacion_actual = await calcular_ocupacion_periodo(session, org_id, mes_inicio, hoy)
    ocupacion_anterior = await calcular_ocupacion_periodo(session, org_id, mes_anterior_inicio, mes_anterior_fin)

    # Ingresos mes actual
    ingresos_actual = (
        await session.exec(
            select(func.sum(Reserva.precio_total))
            .where(Reserva.organizacion_id == org_id)
            .where(Reserva.fecha_entrada >= mes_inicio)
            .where(Reserva.estado.in_(["confirmada", "checkin", "checkout"]))
        )
    ).one() or 0

    ingresos_anterior = (
        await session.exec(
            select(func.sum(Reserva.precio_total))
            .where(Reserva.organizacion_id == org_id)
            .where(Reserva.fecha_entrada >= mes_anterior_inicio)
            .where(Reserva.fecha_entrada <= mes_anterior_fin)
            .where(Reserva.estado.in_(["confirmada", "checkin", "checkout"]))
        )
    ).one() or 0

    # Total reservas mes
    reservas_actual = (
        await session.exec(
            select(func.count(Reserva.id))
            .where(Reserva.organizacion_id == org_id)
            .where(Reserva.fecha_reserva >= mes_inicio)
        )
    ).one()

    reservas_anterior = (
        await session.exec(
            select(func.count(Reserva.id))
            .where(Reserva.organizacion_id == org_id)
            .where(Reserva.fecha_reserva >= mes_anterior_inicio)
            .where(Reserva.fecha_reserva <= mes_anterior_fin)
        )
    ).one()

    # Huéspedes únicos
    huespedes_actual = (
        await session.exec(
            select(func.count(func.distinct(Reserva.huesped_id)))
            .where(Reserva.organizacion_id == org_id)
            .where(Reserva.fecha_reserva >= mes_inicio)
        )
    ).one()

    huespedes_anterior = (
        await session.exec(
            select(func.count(func.distinct(Reserva.huesped_id)))
            .where(Reserva.organizacion_id == org_id)
            .where(Reserva.fecha_reserva >= mes_anterior_inicio)
            .where(Reserva.fecha_reserva <= mes_anterior_fin)
        )
    ).one()

    return {
        "ocupacion": {
            "valor": round(ocupacion_actual, 1),
            "cambio": calcular_cambio_porcentual(ocupacion_actual, ocupacion_anterior)
        },
        "ingresos": {
            "valor": float(ingresos_actual),
            "cambio": calcular_cambio_porcentual(ingresos_actual, ingresos_anterior)
        },
        "reservas": {
            "valor": reservas_actual,
            "cambio": calcular_cambio_porcentual(reservas_actual, reservas_anterior)
        },
        "huespedes": {
            "valor": huespedes_actual,
            "cambio": calcular_cambio_porcentual(huespedes_actual, huespedes_anterior)
        }
    }


async def calcular_ocupacion_periodo(session, org_id: int, fecha_inicio, fecha_fin):
    """Helper para calcular ocupación en un período"""
    total_habitaciones = (
        await session.exec(
            select(func.count(Habitacion.id))
            .where(Habitacion.organizacion_id == org_id)
            .where(Habitacion.activo == True)
        )
    ).one()

    dias = (fecha_fin - fecha_inicio).days + 1
    capacidad_total = total_habitaciones * dias

    reservas = await session.exec(
        select(Reserva)
        .where(Reserva.organizacion_id == org_id)
        .where(Reserva.fecha_entrada <= fecha_fin)
        .where(Reserva.fecha_salida >= fecha_inicio)
        .where(Reserva.estado.in_(["confirmada", "checkin", "checkout"]))
    )

    noches_ocupadas = 0
    for reserva in reservas:
        entrada = max(reserva.fecha_entrada, fecha_inicio)
        salida = min(reserva.fecha_salida, fecha_fin)
        if entrada < salida:
            noches_ocupadas += (salida - entrada).days

    return (noches_ocupadas / capacidad_total * 100) if capacidad_total > 0 else 0


def calcular_cambio_porcentual(actual, anterior):
    """Calcula el % de cambio entre dos valores"""
    if anterior == 0:
        return 100 if actual > 0 else 0
    return round(((actual - anterior) / anterior) * 100, 1)
