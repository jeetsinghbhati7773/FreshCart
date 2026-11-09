from pathlib import Path
from typing import Literal, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    AI_SERVICE_PORT: int = 8005
    AI_SERVICE_HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"

    # LLM Settings
    LLM_PROVIDER: Literal["gemini", "openai", "groq"] = "groq"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Express Backend Integration
    EXPRESS_API_BASE_URL: str = "http://localhost:10000"
    INTERNAL_API_KEY: str = "shoppilot_internal_secret_key_step2_2026"

    model_config = SettingsConfigDict(
        env_file=(_ENV_PATH, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

