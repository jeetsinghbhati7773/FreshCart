import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.routes import health, chat, shopping_plan, cart_optimization

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("shoppilot-ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ShopPilot AI Microservice...")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")
    logger.info(f"Connected Express URL: {settings.EXPRESS_API_BASE_URL}")
    yield
    logger.info("Shutting down ShopPilot AI Microservice...")


app = FastAPI(
    title="ShopPilot AI Shopping Microservice",
    description="Conversational AI agent for autonomous grocery planning and product matching.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:10000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:10000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(shopping_plan.router)
app.include_router(cart_optimization.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal AI microservice error",
            "detail": str(exc),
        },
    )


@app.get("/")
async def root():
    return {
        "service": "ShopPilot AI Shopping Microservice",
        "status": "operational",
        "docs": "/docs",
    }

