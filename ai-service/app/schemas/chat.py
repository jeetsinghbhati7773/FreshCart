from decimal import Decimal
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field
from app.schemas.intent import ShoppingIntent
from app.schemas.grocery_plan import GroceryItem, MatchedProduct
from app.optimization.optimization_models import OptimizedCart


class ChatRequest(BaseModel):
    conversation_id: str = Field(description="Unique session/conversation identifier")
    user_id: Optional[str] = Field(default=None, description="Optional authenticated user ID")
    message: str = Field(description="Natural language message from the customer")
    user_memories: Optional[List[Dict[str, Any]]] = Field(default=None, description="User-specific long term memories")
    conversation_summary: Optional[str] = Field(default=None, description="Compact historical summary")


class PlanRequest(BaseModel):
    conversation_id: str
    user_id: Optional[str] = None
    intent: ShoppingIntent


class ChatResponse(BaseModel):
    conversation_id: str
    status: Literal["clarification_needed", "plan_generated", "error"]
    intent: Optional[ShoppingIntent] = None
    clarification_question: Optional[str] = None
    grocery_plan: List[GroceryItem] = Field(default_factory=list)
    matched_products: List[MatchedProduct] = Field(default_factory=list)
    estimated_total: Decimal = Field(default=Decimal("0.0"))
    budget_status: Literal["within_budget", "exceeded", "not_calculated"] = "not_calculated"
    budget_difference: Decimal = Field(default=Decimal("0.0"))
    optimized_cart: Optional[OptimizedCart] = None
    assistant_message: str
    message: Optional[str] = None

