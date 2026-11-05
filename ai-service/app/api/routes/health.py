from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint reporting microservice status,
    active LLM provider configuration (without exposing secrets),
    and connected Express backend endpoint.
    """
    has_groq = bool(settings.GROQ_API_KEY)
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)

    return {
        "status": "healthy",
        "service": "ShopPilot AI Shopping Microservice",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER,
        "providers_configured": {
            "groq": has_groq,
            "gemini": has_gemini,
            "openai": has_openai,
        },
        "express_api_base_url": settings.EXPRESS_API_BASE_URL,
    }

