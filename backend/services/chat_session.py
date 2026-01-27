"""
Gestión de sesiones de chat en memoria.
Mantiene el contexto de conversación sin reenviar el system prompt en cada consulta.
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional, Any
import asyncio


class ChatSession:
    """
    Representa una sesión de chat con su historial y contexto.
    """

    def __init__(self, session_id: str, system_prompt: str, context: dict = None, session_type: str = "default"):
        self.session_id = session_id
        self.system_prompt = system_prompt
        self.context = context or {}
        self.session_type = session_type
        self.messages: list[dict[str, str]] = []
        self.created_at = datetime.now()
        self.last_activity = datetime.now()

    def add_message(self, role: str, content: str):
        """Agrega un mensaje al historial"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.last_activity = datetime.now()

    def get_messages(self, limit: int = None) -> list[dict]:
        """Obtiene los mensajes del historial (sin timestamps)"""
        messages = [{"role": msg["role"], "content": msg["content"]} for msg in self.messages]
        if limit:
            return messages[-limit:]
        return messages

    def update_system_prompt(self, system_prompt: str):
        """Actualiza el system prompt de la sesión"""
        self.system_prompt = system_prompt
        self.last_activity = datetime.now()

    def update_context(self, context: dict):
        """Actualiza el contexto de la sesión"""
        self.context.update(context)
        self.last_activity = datetime.now()

    def is_expired(self, ttl_minutes: int = 60) -> bool:
        """Verifica si la sesión está expirada"""
        return datetime.now() - self.last_activity > timedelta(minutes=ttl_minutes)


class ChatSessionStorage:
    """
    Almacenamiento en memoria de sesiones de chat.
    Auto-limpia sesiones expiradas periódicamente.
    """

    def __init__(self, ttl_minutes: int = 60):
        self._sessions: dict[str, ChatSession] = {}
        self._user_sessions: dict[str, str] = {}  # user_id+type -> session_id
        self.ttl_minutes = ttl_minutes

    async def create_session(self, system_prompt: str, context: dict = None, session_type: str = "default") -> str:
        """Crea una nueva sesión y retorna su ID"""
        session_id = str(uuid.uuid4())
        session = ChatSession(session_id, system_prompt, context, session_type)
        self._sessions[session_id] = session
        return session_id

    async def get_session(self, session_id: str) -> Optional[dict]:
        """Obtiene los datos de una sesión"""
        session = self._sessions.get(session_id)
        if not session:
            return None

        if session.is_expired(self.ttl_minutes):
            await self.delete_session(session_id)
            return None

        return {
            "session_id": session.session_id,
            "system_prompt": session.system_prompt,
            "context": session.context,
            "session_type": session.session_type,
            "messages": session.get_messages(),
            "created_at": session.created_at,
            "last_activity": session.last_activity
        }

    async def get_or_create_for_user(
        self,
        user_id: int,
        system_prompt: str,
        context: dict = None,
        session_type: str = "default"
    ) -> tuple[str, bool]:
        """
        Obtiene o crea una sesión para un usuario específico.

        Returns:
            (session_id, is_new)
        """
        key = f"{user_id}:{session_type}"

        # Verificar si ya existe sesión para este usuario+tipo
        if key in self._user_sessions:
            session_id = self._user_sessions[key]
            session_data = await self.get_session(session_id)

            if session_data:
                # Sesión válida, retornar
                return session_id, False

        # Crear nueva sesión
        session_id = await self.create_session(system_prompt, context, session_type)
        self._user_sessions[key] = session_id
        return session_id, True

    async def add_message(self, session_id: str, role: str, content: str):
        """Agrega un mensaje al historial de la sesión"""
        session = self._sessions.get(session_id)
        if session:
            session.add_message(role, content)

    async def get_messages(self, session_id: str, limit: int = None) -> list[dict]:
        """Obtiene los mensajes de una sesión"""
        session = self._sessions.get(session_id)
        if session:
            return session.get_messages(limit)
        return []

    async def update_session(self, session_id: str, system_prompt: str = None, context: dict = None):
        """Actualiza el system prompt y/o contexto de una sesión"""
        session = self._sessions.get(session_id)
        if session:
            if system_prompt:
                session.update_system_prompt(system_prompt)
            if context:
                session.update_context(context)

    async def delete_session(self, session_id: str):
        """Elimina una sesión"""
        if session_id in self._sessions:
            del self._sessions[session_id]

        # Limpiar de user_sessions también
        keys_to_delete = [k for k, v in self._user_sessions.items() if v == session_id]
        for key in keys_to_delete:
            del self._user_sessions[key]

    async def cleanup_expired(self):
        """Limpia sesiones expiradas"""
        expired_ids = [
            session_id
            for session_id, session in self._sessions.items()
            if session.is_expired(self.ttl_minutes)
        ]

        for session_id in expired_ids:
            await self.delete_session(session_id)

        if expired_ids:
            print(f"[CHAT SESSION] Limpiadas {len(expired_ids)} sesiones expiradas")

    def get_stats(self) -> dict:
        """Retorna estadísticas del storage"""
        return {
            "total_sessions": len(self._sessions),
            "user_sessions": len(self._user_sessions),
            "ttl_minutes": self.ttl_minutes
        }


# Instancias globales (singleton pattern)
_landing_storage: Optional[ChatSessionStorage] = None
_user_storage: Optional[ChatSessionStorage] = None


def get_landing_storage() -> ChatSessionStorage:
    """Storage para sesiones de chat público (landing page)"""
    global _landing_storage
    if _landing_storage is None:
        _landing_storage = ChatSessionStorage(ttl_minutes=30)  # TTL más corto para landing
    return _landing_storage


def get_user_storage() -> ChatSessionStorage:
    """Storage para sesiones de usuarios autenticados"""
    global _user_storage
    if _user_storage is None:
        _user_storage = ChatSessionStorage(ttl_minutes=120)  # TTL más largo para usuarios
    return _user_storage


# Tarea de limpieza periódica (se puede llamar desde main.py)
async def periodic_cleanup():
    """Limpia sesiones expiradas cada 15 minutos"""
    while True:
        await asyncio.sleep(15 * 60)  # 15 minutos
        await get_landing_storage().cleanup_expired()
        await get_user_storage().cleanup_expired()
