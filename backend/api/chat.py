"""
API para Chat con IA - Business Intelligence
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from core.security import get_current_user
from models import Usuario, Organizacion
from services.bi_chat_service import get_bi_chat_service
from sqlalchemy import inspect

router = APIRouter(prefix="/chat", tags=["Chat"])


# ============ SCHEMAS ============

class ConsultaRequest(BaseModel):
    consulta: str
    formato: Optional[str] = None


class ConsultaResponse(BaseModel):
    response: str
    datos_crudos: list[dict]
    sql_ejecutado: str
    mostrar_grilla: bool


# ============ ENDPOINTS ============

@router.get("/schema")
async def get_schema(
    session=Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna el esquema de la base de datos para autocomplete
    """
    schema = {}

    # Función sync para ejecutar dentro de run_sync
    def get_table_schema(conn):
        inspector = inspect(conn)
        result = {}

        # Obtener TODAS las tablas dinámicamente
        all_tables = inspector.get_table_names()

        for table_name in all_tables:
            try:
                columns = []

                # Obtener columnas de la tabla
                table_columns = inspector.get_columns(table_name)

                # Obtener FKs una sola vez
                table_fks = inspector.get_foreign_keys(table_name)

                for col in table_columns:
                    # Usar corchetes en vez de .get() para evitar referencias circulares
                    col_info = {
                        "name": col["name"],
                        "type": str(col["type"]),
                        "nullable": col.get("nullable", True),
                        "is_fk": False
                    }

                    # Detectar si es FK
                    for fk in table_fks:
                        if col["name"] in fk["constrained_columns"]:
                            col_info["is_fk"] = True
                            col_info["fk_table"] = fk["referred_table"]
                            col_info["fk_column"] = fk["referred_columns"][0]
                            break

                    columns.append(col_info)

                result[table_name] = columns

            except Exception as e:
                print(f"[SCHEMA] Error con tabla {table_name}: {e}")
                continue

        return result

    # Ejecutar inspección dentro de conn.run_sync
    async with session.bind.connect() as conn:
        schema = await conn.run_sync(get_table_schema)

    return {"tables": schema}


@router.get("/entities")
async def get_entities(
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna metadatos de las entidades leyendo los JSON del CLI
    """
    import json
    from pathlib import Path

    entities = []

    # Buscar archivos JSON en la carpeta cli/
    cli_path = Path(__file__).parent.parent.parent / "cli"
    json_files = ["negocio.json", "auditoria.json"]

    for json_file in json_files:
        file_path = cli_path / json_file
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                    if "entities" in data:
                        for entity in data["entities"]:
                            # Extraer campos del string fields
                            fields_str = entity.get("fields", "")
                            campos = []

                            if fields_str:
                                # Parsear fields: "nombre:string:req apellido:string email:email"
                                field_parts = fields_str.split()
                                for field in field_parts:
                                    field_name = field.split(':')[0]
                                    campos.append(field_name)

                            entities.append({
                                "nombre": entity.get("name", ""),
                                "plural": entity.get("plural", ""),
                                "tabla": entity.get("table", ""),
                                "icono": entity.get("icon", "Folder"),
                                "descripcion": f"Entidad {entity.get('name', '')}",
                                "campos": campos[:5]  # Primeros 5 campos
                            })
            except Exception as e:
                print(f"[ENTITIES] Error leyendo {json_file}: {e}")
                continue

    return {"entities": entities}


@router.get("/pills")
async def get_pills(
    session=Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna pills/filtros dinámicos calculados con algoritmos propios (no IA)
    """
    # TODO: Implementar pills específicos del dominio
    return {"pills": []}


@router.get("/kpis")
async def get_kpis(
    session=Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna KPIs rápidos para el dashboard
    """
    # TODO: Implementar KPIs específicos del dominio
    return {"kpis": []}


@router.post("/consulta", response_model=ConsultaResponse)
async def ejecutar_consulta(
    request: ConsultaRequest,
    session=Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Ejecuta una consulta en lenguaje natural
    """
    chat_service = get_bi_chat_service()

    if not chat_service.is_available():
        raise HTTPException(
            status_code=503,
            detail="El servicio de chat no está disponible. Configurar GROQ_API_KEY en el servidor."
        )

    # Obtener esquema usando conn.run_sync
    def get_all_tables_schema(conn):
        inspector = inspect(conn)
        result = {}
        for table_name in inspector.get_table_names():
            try:
                columns = []
                for col in inspector.get_columns(table_name):
                    columns.append({
                        "name": col["name"],
                        "type": str(col["type"])
                    })
                result[table_name] = columns
            except:
                continue
        return result

    async with session.bind.connect() as conn:
        schema = await conn.run_sync(get_all_tables_schema)

    # Ejecutar consulta
    resultado = await chat_service.consultar(
        consulta=request.consulta,
        schema=schema,
        session=session,
        org_id=current_user.organizacion_id,
        formato=request.formato
    )

    return ConsultaResponse(**resultado)


@router.get("/consultas-guardadas")
async def get_consultas_guardadas(
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna consultas guardadas del usuario
    TODO: Implementar modelo ConsultaGuardada si es necesario
    """
    return {"consultas": []}


@router.post("/consultas-guardadas")
async def crear_consulta_guardada(
    nombre: str,
    consulta: str,
    current_user: Usuario = Depends(get_current_user)
):
    """
    Crea una nueva consulta guardada
    TODO: Implementar modelo ConsultaGuardada si es necesario
    """
    return {"success": True, "message": "Funcionalidad pendiente"}


@router.delete("/consultas-guardadas/{consulta_id}")
async def eliminar_consulta_guardada(
    consulta_id: int,
    current_user: Usuario = Depends(get_current_user)
):
    """
    Elimina una consulta guardada
    TODO: Implementar modelo ConsultaGuardada si es necesario
    """
    return {"success": True}


@router.post("/consultas-guardadas/{consulta_id}/ejecutar")
async def ejecutar_consulta_guardada(
    consulta_id: int,
    session=Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Ejecuta una consulta guardada
    TODO: Implementar modelo ConsultaGuardada si es necesario
    """
    return {
        "response": "<p>Funcionalidad pendiente</p>",
        "datos_crudos": [],
        "sql_ejecutado": "",
        "mostrar_grilla": False
    }
