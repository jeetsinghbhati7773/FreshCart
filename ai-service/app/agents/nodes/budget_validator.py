from decimal import Decimal
import logging
from typing import Any, Dict

from app.agents.state import AgentState
from app.schemas.grocery_plan import GroceryItem, MatchedProduct
from app.services.budget_service import budget_service

logger = logging.getLogger(__name__)


async def budget_validator_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph node: Validates total shopping cost against customer budget
    using authoritative database pricing and Decimal arithmetic.
    """
    raw_matches = state.get("matched_products") or []
    raw_items = state.get("grocery_items") or []
    intent = state.get("shopping_intent") or {}

    matched_products = [MatchedProduct(**m) for m in raw_matches]
    grocery_items = [GroceryItem(**i) for i in raw_items]

    raw_budget = intent.get("budget")
    budget = Decimal(str(raw_budget)) if raw_budget is not None else None

    plan_result = budget_service.calculate_plan_budget(
        matched_products=matched_products,
        grocery_items=grocery_items,
        budget=budget,
    )

    return {
        "matched_products": [m.model_dump(mode="json") for m in plan_result.matched_products],
        "estimated_total": float(plan_result.estimated_total),
        "budget_status": plan_result.budget_status,
        "budget_difference": float(plan_result.budget_difference),
        "suggestions": plan_result.suggestions,
    }

