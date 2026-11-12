import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.agents.seller import run_seller_agent

logger = logging.getLogger("shoppilot-seller-route")

router = APIRouter(prefix="/api/ai/seller", tags=["Seller AI"])


class HistoryItem(BaseModel):
    role: str
    content: str


class SellerChatRequest(BaseModel):
    conversation_id: str
    seller_email: str
    message: str = Field(..., min_length=1)
    history: List[HistoryItem] = Field(default_factory=list)


class SellerChatResponse(BaseModel):
    success: bool = True
    conversation_id: str
    reply: str
    message_type: str = "text"
    tools_used: List[str] = Field(default_factory=list)
    pending_action: Optional[Dict[str, Any]] = None
    structured_data: Optional[Dict[str, Any]] = None


@router.post("/chat", response_model=SellerChatResponse)
async def seller_chat(
    req: SellerChatRequest,
    x_internal_api_key: Optional[str] = Header(default=None),
):
    if x_internal_api_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid internal API key")

    result = await run_seller_agent(
        message=req.message,
        history=[h.model_dump() for h in req.history],
    )

    return SellerChatResponse(
        success=True,
        conversation_id=req.conversation_id,
        reply=result["reply"],
        message_type=result.get("message_type", "text"),
        tools_used=result.get("tools_used", []),
        pending_action=result.get("pending_action"),
        structured_data=result.get("structured_data"),
    )

