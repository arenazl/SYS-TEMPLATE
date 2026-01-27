"""
Servicio centralizado de chat con IA.
Soporta Claude API (Anthropic) con fallback automático.
"""
import os
from anthropic import AsyncAnthropic
from typing import Optional
import asyncio


class ChatService:
    """
    Servicio de chat con IA usando Claude API (Anthropic).

    Configuración:
    - ANTHROPIC_API_KEY: API key de Claude
    """

    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

        # Cliente de Anthropic (inicializar solo si hay API key)
        self.anthropic_client = AsyncAnthropic(api_key=self.anthropic_key) if self.anthropic_key else None

    def is_available(self) -> bool:
        """Verifica si hay al menos un proveedor disponible"""
        return bool(self.anthropic_key)

    async def chat(self, messages: str | list[dict], max_tokens: int = 1000) -> Optional[str]:
        """
        Envía un mensaje a la IA y retorna la respuesta.

        Args:
            messages: String simple o lista de dict con formato [{"role": "user", "content": "..."}]
            max_tokens: Máximo de tokens a generar

        Returns:
            Respuesta de la IA o None si falla
        """
        # Convertir string a formato de mensajes si es necesario
        if isinstance(messages, str):
            messages = [{"role": "user", "content": messages}]

        # Intentar con Claude
        if self.anthropic_client:
            try:
                print(f"[CHAT SERVICE] Usando Claude API ({self.anthropic_model})")
                response = await self._chat_anthropic(messages, max_tokens)
                if response:
                    return response
            except Exception as e:
                print(f"[CHAT SERVICE] Error con Claude: {e}")

        return None

    async def _chat_anthropic(self, messages: list[dict], max_tokens: int) -> Optional[str]:
        """Llama a la API de Claude (Anthropic)"""
        # Separar system prompt del resto de mensajes
        system_prompt = ""
        chat_messages = []

        for msg in messages:
            if msg.get("role") == "system":
                system_prompt = msg.get("content", "")
            else:
                chat_messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })

        # Si no hay mensajes de usuario, agregar uno vacío
        if not chat_messages:
            chat_messages = [{"role": "user", "content": ""}]

        # Llamar a la API
        response = await self.anthropic_client.messages.create(
            model=self.anthropic_model,
            max_tokens=max_tokens,
            system=system_prompt if system_prompt else None,
            messages=chat_messages
        )

        # Extraer texto de la respuesta
        if response.content and len(response.content) > 0:
            return response.content[0].text

        return None

    def build_chat_messages(self, system_prompt: str, message: str, history: list[dict] = None) -> list[dict]:
        """
        Construye el array de mensajes para la API.

        Args:
            system_prompt: Prompt del sistema
            message: Mensaje actual del usuario
            history: Historial de mensajes previos [{"role": "user/assistant", "content": "..."}]

        Returns:
            Lista de mensajes formateada para la API
        """
        messages = []

        # Agregar system prompt
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        # Agregar historial
        if history:
            messages.extend(history)

        # Agregar mensaje actual
        messages.append({"role": "user", "content": message})

        return messages

    def build_chat_context(self, system_prompt: str, message: str, history: list[dict] = None) -> list[dict]:
        """Alias de build_chat_messages para compatibilidad"""
        return self.build_chat_messages(system_prompt, message, history)


# Singleton global
_chat_service_instance: Optional[ChatService] = None


def get_chat_service() -> ChatService:
    """Obtiene la instancia singleton del servicio de chat"""
    global _chat_service_instance
    if _chat_service_instance is None:
        _chat_service_instance = ChatService()
    return _chat_service_instance


# Exportar instancia directamente para uso simple
chat_service = get_chat_service()
