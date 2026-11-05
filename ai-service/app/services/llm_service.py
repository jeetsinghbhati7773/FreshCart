import json
import logging
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel, ValidationError

from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMService:
    """
    Provider-agnostic LLM client supporting Gemini and OpenAI
    with structured output validation, error handling, and retries.
    """

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self._client = None
        self._init_provider()

    def _init_provider(self):
        if self.provider == "groq":
            if not settings.GROQ_API_KEY:
                logger.warning("GROQ_API_KEY is not set. Using rule-based fallback engine.")
                self._client = None
                return
            try:
                from langchain_groq import ChatGroq
                self._client = ChatGroq(
                    model=settings.GROQ_MODEL,
                    groq_api_key=settings.GROQ_API_KEY,
                    temperature=0.2,
                    timeout=30,
                    max_retries=2,
                )
            except Exception as e:
                logger.error(f"Failed to initialize ChatGroq: {e}")
                self._client = None

        elif self.provider == "gemini":
            if not settings.GEMINI_API_KEY:
                logger.warning("GEMINI_API_KEY is not set. Using rule-based fallback engine.")
                self._client = None
                return
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                self._client = ChatGoogleGenerativeAI(
                    model=settings.GEMINI_MODEL,
                    google_api_key=settings.GEMINI_API_KEY,
                    temperature=0.2,
                    timeout=30,
                    max_retries=2,
                )
            except Exception as e:
                logger.error(f"Failed to initialize ChatGoogleGenerativeAI: {e}")
                self._client = None

        elif self.provider == "openai":
            if not settings.OPENAI_API_KEY:
                logger.warning("OPENAI_API_KEY is not set. Using rule-based fallback engine.")
                self._client = None
                return
            try:
                from langchain_openai import ChatOpenAI
                self._client = ChatOpenAI(
                    model=settings.OPENAI_MODEL,
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.2,
                    timeout=30,
                    max_retries=2,
                )
            except Exception as e:
                logger.error(f"Failed to initialize ChatOpenAI: {e}")
                self._client = None
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[T],
        retries: int = 2,
    ) -> T:
        """
        Invokes LLM with structured output enforcement and validates response with Pydantic.
        """
        if not self._client:
            raise RuntimeError(
                f"LLM client for provider '{self.provider}' is not configured. "
                f"Please check your API keys in .env."
            )

        last_error = None
        for attempt in range(retries + 1):
            try:
                from langchain_core.messages import SystemMessage, HumanMessage

                # Try with_structured_output if supported
                try:
                    structured_llm = self._client.with_structured_output(response_model)
                    messages = [
                        SystemMessage(content=system_prompt),
                        HumanMessage(content=user_prompt),
                    ]
                    result = await structured_llm.ainvoke(messages)
                    if isinstance(result, response_model):
                        return result
                    elif isinstance(result, dict):
                        return response_model.model_validate(result)
                except Exception as structured_err:
                    logger.debug(f"Structured invocation fallback to json extraction: {structured_err}")
                    # Direct message fallback with json prompt enforcement
                    json_prompt = (
                        f"{user_prompt}\n\nRespond with strict JSON adhering to: "
                        f"{json.dumps(response_model.model_json_schema())}"
                    )
                    messages = [
                        SystemMessage(content=system_prompt),
                        HumanMessage(content=json_prompt),
                    ]
                    response = await self._client.ainvoke(messages)
                    content = response.content
                    if isinstance(content, list):
                        content = "".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
                    # Strip any markdown backticks
                    cleaned = content.strip()
                    if cleaned.startswith("```json"):
                        cleaned = cleaned[7:]
                    elif cleaned.startswith("```"):
                        cleaned = cleaned[3:]
                    if cleaned.endswith("```"):
                        cleaned = cleaned[:-3]
                    cleaned = cleaned.strip()

                    parsed_dict = json.loads(cleaned)
                    return response_model.model_validate(parsed_dict)

            except (ValidationError, json.JSONDecodeError) as e:
                logger.warning(f"Attempt {attempt + 1} validation/JSON error: {e}")
                last_error = e
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} provider error: {e}")
                last_error = e

        raise RuntimeError(f"LLM failed after {retries + 1} attempts. Last error: {last_error}")

    async def generate_text(self, system_prompt: str, user_prompt: str) -> str:
        """Generate conversational text response."""
        if not self._client:
            raise RuntimeError(f"LLM client for provider '{self.provider}' is not configured.")

        from langchain_core.messages import SystemMessage, HumanMessage
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
        response = await self._client.ainvoke(messages)
        content = response.content
        if isinstance(content, list):
            content = "".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
        return str(content).strip()


# Singleton instance
llm_service = LLMService()
