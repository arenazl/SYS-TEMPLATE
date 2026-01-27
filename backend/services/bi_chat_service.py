"""
Servicio de chat con IA para Business Intelligence
Convierte lenguaje natural a SQL usando Groq
"""
import os
import json
from typing import Optional, Any, List
from pathlib import Path
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, text
from datetime import datetime

# Templates directory
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
_TEMPLATES_CACHE: dict = {}


def load_template(template_id: str) -> dict | None:
    """Carga un template JSON desde backend/templates/"""
    global _TEMPLATES_CACHE

    if template_id in _TEMPLATES_CACHE:
        return _TEMPLATES_CACHE[template_id]

    template_path = TEMPLATES_DIR / f"{template_id}.json"
    if not template_path.exists():
        print(f"[BI TEMPLATES] Template no encontrado: {template_id}")
        return None

    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            template = json.load(f)
            _TEMPLATES_CACHE[template_id] = template
            print(f"[BI TEMPLATES] Template '{template_id}' cargado OK")
            return template
    except Exception as e:
        print(f"[BI TEMPLATES] Error cargando template '{template_id}': {e}")
        return None


def detectar_formato_automatico(pregunta: str) -> str | None:
    """Detecta formato basado en palabras clave en la consulta"""
    pregunta_lower = pregunta.lower()
    index_path = TEMPLATES_DIR / "_index.json"

    if not index_path.exists():
        return None

    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            index = json.load(f)
    except:
        return None

    if 'deteccion_automatica' not in index:
        return None

    for regla in index['deteccion_automatica']['reglas']:
        for palabra in regla['palabras']:
            if palabra in pregunta_lower:
                print(f"[BI TEMPLATES] Detectado formato '{regla['template']}' por: '{palabra}'")
                return regla['template']

    return None


class BIChatService:
    """
    Servicio de chat con IA para consultas de BI.
    Usa Groq para convertir lenguaje natural a SQL.
    """

    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY", "")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def is_available(self) -> bool:
        """Verifica si Groq está disponible"""
        return bool(self.groq_key)

    async def consultar(
        self,
        consulta: str,
        schema: dict,
        session: AsyncSession,
        org_id: int,
        historial: list[dict] = None,
        formato: str = None
    ) -> dict:
        """
        Ejecuta una consulta en lenguaje natural contra la BD.

        Args:
            consulta: Pregunta del usuario en lenguaje natural
            schema: Esquema de la base de datos
            session: Sesión de SQLAlchemy
            org_id: ID de la organización
            historial: Historial de mensajes previos
            formato: Formato de visualización (cards, ranking, table, etc.)

        Returns:
            {
                "response": "<html>",
                "datos_crudos": [...],
                "sql_ejecutado": "SELECT ...",
                "mostrar_grilla": bool,
                "formato_aplicado": str
            }
        """
        if not self.is_available():
            return {
                "response": "<p style='color:#ef4444'>Error: No está configurada la API key de Groq</p>",
                "datos_crudos": [],
                "sql_ejecutado": "",
                "mostrar_grilla": False
            }

        try:
            # 1. Generar SQL a partir del lenguaje natural
            sql_query = await self._generar_sql(consulta, schema, historial)

            # 2. Ejecutar SQL
            datos = await self._ejecutar_sql(sql_query, session, org_id)

            # 3. Detectar formato si no se especificó
            if not formato:
                formato = detectar_formato_automatico(consulta)

            # 4. Formatear respuesta
            response_html = await self._formatear_respuesta(consulta, datos, sql_query, formato)

            return {
                "response": response_html,
                "datos_crudos": datos,
                "sql_ejecutado": sql_query,
                "mostrar_grilla": len(datos) > 0,
                "formato_aplicado": formato or "auto"
            }

        except Exception as e:
            print(f"[BI CHAT] Error: {e}")
            return {
                "response": f"<p style='color:#ef4444'>Error: {str(e)}</p>",
                "datos_crudos": [],
                "sql_ejecutado": "",
                "mostrar_grilla": False,
                "formato_aplicado": None
            }

    async def _generar_sql(self, consulta: str, schema: dict, historial: list[dict] = None) -> str:
        """Genera SQL a partir de lenguaje natural usando Groq"""

        # Construir el esquema completo de la BD
        schema_str = self._build_schema_context(schema)

        system_prompt = f"""Eres un experto en SQL para MySQL/MariaDB.

{schema_str}

REGLAS IMPORTANTES:
1. SIEMPRE incluir WHERE organizacion_id = :org_id en todas las consultas
2. Usar nombres de tablas y columnas EXACTAMENTE como aparecen en el esquema
3. Para relaciones, usar los campos FK indicados para hacer JOINs
4. Retornar SOLO el SQL, sin explicaciones
5. Usar LIMIT 100 por defecto si no se especifica
6. Para fechas, usar funciones MySQL (NOW(), DATE_SUB(), etc)
7. Para agregaciones, incluir GROUP BY apropiado
"""

        # Construir mensajes
        messages = [{"role": "system", "content": system_prompt}]

        if historial:
            messages.extend(historial[-4:])  # Últimos 4 mensajes

        messages.append({
            "role": "user",
            "content": consulta
        })

        # Llamar a Groq con httpx
        print(f"[BI CHAT] Llamando a Groq con {len(messages)} mensajes, modelo: {self.groq_model}")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.groq_key}"
                    },
                    json={
                        "model": self.groq_model,
                        "messages": messages,
                        "max_tokens": 500,
                        "temperature": 0.1
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    sql = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                    print(f"[BI CHAT] Respuesta OK, SQL generado: {sql[:200] if sql else 'VACÍO'}...")

                    # Limpiar SQL (remover markdown si existe)
                    if sql.startswith("```sql"):
                        sql = sql.replace("```sql", "").replace("```", "").strip()
                    elif sql.startswith("```"):
                        sql = sql.replace("```", "").strip()

                    return sql.strip() if sql else ""
                else:
                    print(f"[BI CHAT] Error {response.status_code}: {response.text[:200]}")
                    raise ValueError(f"Error en Groq API: {response.status_code}")

        except Exception as e:
            print(f"[BI CHAT] Excepción: {e}")
            raise

    async def _ejecutar_sql(self, sql: str, session: AsyncSession, org_id: int) -> list[dict]:
        """Ejecuta SQL y retorna resultados"""

        # Reemplazar :org_id con el valor real
        sql = sql.replace(":org_id", str(org_id))

        # Validar que sea un SELECT
        sql_upper = sql.upper().strip()
        if not sql_upper.startswith("SELECT"):
            raise ValueError("Solo se permiten consultas SELECT")

        # Validar que no contenga comandos peligrosos
        dangerous = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", "TRUNCATE"]
        for cmd in dangerous:
            if cmd in sql_upper:
                raise ValueError(f"Comando no permitido: {cmd}")

        # Ejecutar
        result = await session.exec(text(sql))
        rows = result.fetchall()

        # Convertir a lista de diccionarios
        if not rows:
            return []

        columns = result.keys()
        return [dict(zip(columns, row)) for row in rows]

    async def _formatear_respuesta(self, consulta: str, datos: list[dict], sql: str, formato: str = None) -> str:
        """Formatea los datos como HTML según el formato especificado"""

        if not datos:
            return "<p style='color:#f59e0b'>No se encontraron resultados para esta consulta.</p>"

        # Cargar template si hay formato especificado
        template = load_template(formato) if formato else None

        if template:
            print(f"[BI CHAT] Usando template: {formato}")
            # TODO: Aquí se formateará usando el template
            # Por ahora usamos el formato automático básico

        # Fallback: formato automático básico

        # Detectar tipo de formato basado en la consulta
        formato = self._detectar_formato(consulta, datos)

        if formato == "kpi" and len(datos) == 1 and len(datos[0]) == 1:
            # Formato KPI simple (un solo número)
            valor = list(datos[0].values())[0]
            return f"""
            <div style="text-align:center; padding:2rem;">
                <div style="font-size:3rem; font-weight:bold; color:#3b82f6;">{valor}</div>
                <div style="color:#9ca3af; margin-top:0.5rem;">{list(datos[0].keys())[0]}</div>
            </div>
            """

        elif formato == "lista" and len(datos[0]) <= 2:
            # Formato lista simple
            html = "<ul style='list-style:none; padding:0;'>"
            for row in datos[:20]:  # Máximo 20 items
                valores = list(row.values())
                html += f"<li style='padding:0.5rem; border-bottom:1px solid #374151;'>"
                html += f"<strong>{valores[0]}</strong>"
                if len(valores) > 1:
                    html += f" <span style='color:#9ca3af;'>• {valores[1]}</span>"
                html += "</li>"
            html += "</ul>"
            return html

        else:
            # Formato tabla
            return self._formatear_tabla(datos)

    def _formatear_tabla(self, datos: list[dict]) -> str:
        """Formatea datos como tabla HTML"""
        html = "<table style='width:100%; border-collapse:collapse;'>"

        # Header
        html += "<thead><tr>"
        for key in datos[0].keys():
            html += f"<th style='text-align:left; padding:0.75rem; border-bottom:2px solid #374151; color:#9ca3af; font-weight:600;'>{key}</th>"
        html += "</tr></thead>"

        # Body
        html += "<tbody>"
        for row in datos[:50]:  # Máximo 50 filas
            html += "<tr style='border-bottom:1px solid #1f2937;'>"
            for value in row.values():
                # Formatear valores
                if isinstance(value, (int, float)):
                    formatted = f"{value:,.2f}" if isinstance(value, float) else f"{value:,}"
                elif isinstance(value, datetime):
                    formatted = value.strftime("%Y-%m-%d %H:%M")
                else:
                    formatted = str(value)

                html += f"<td style='padding:0.75rem;'>{formatted}</td>"
            html += "</tr>"
        html += "</tbody></table>"

        if len(datos) > 50:
            html += f"<p style='color:#9ca3af; margin-top:1rem; font-size:0.875rem;'>Mostrando 50 de {len(datos)} resultados</p>"

        return html

    def _detectar_formato(self, consulta: str, datos: list[dict]) -> str:
        """Detecta el formato apropiado basado en la consulta y datos"""
        consulta_lower = consulta.lower()

        # KPI si es un agregado simple
        if any(word in consulta_lower for word in ["cuánto", "cuánta", "total", "suma", "promedio"]):
            if len(datos) == 1 and len(datos[0]) == 1:
                return "kpi"

        # Lista si son 2 columnas o menos
        if len(datos[0]) <= 2 and len(datos) <= 20:
            return "lista"

        return "tabla"

    def _build_schema_context(self, schema: dict) -> str:
        """Construye el contexto del esquema completo para Groq"""
        lines = ["ESQUEMA DE LA BASE DE DATOS:\n"]

        for table_name, columns in schema.items():
            lines.append(f"Tabla: {table_name}")
            for col in columns:
                col_type = col.get('type', 'VARCHAR')
                nullable = " NULL" if col.get('nullable', True) else " NOT NULL"

                # Información de FK
                if col.get('is_fk') and col.get('fk_table'):
                    fk_info = f" → FK a {col['fk_table']}.{col.get('fk_column', 'id')}"
                    lines.append(f"  - {col['name']} ({col_type}){nullable}{fk_info}")
                else:
                    lines.append(f"  - {col['name']} ({col_type}){nullable}")

            lines.append("")  # Línea en blanco entre tablas

        return "\n".join(lines)


# Singleton
_bi_chat_service: Optional[BIChatService] = None


def get_bi_chat_service() -> BIChatService:
    """Obtiene la instancia singleton del servicio de chat BI"""
    global _bi_chat_service
    if _bi_chat_service is None:
        _bi_chat_service = BIChatService()
    return _bi_chat_service
