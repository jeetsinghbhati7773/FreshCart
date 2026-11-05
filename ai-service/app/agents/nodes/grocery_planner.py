import json
import logging
from typing import Any, Dict, List
from pydantic import BaseModel

from app.agents.state import AgentState
from app.prompts.grocery_planner_prompt import GROCERY_PLANNER_SYSTEM_PROMPT
from app.schemas.grocery_plan import GroceryItem
from app.services.llm_service import llm_service
from app.services.quantity_service import QuantityService

logger = logging.getLogger(__name__)


class GroceryItemListResponse(BaseModel):
    items: List[GroceryItem]


def generate_rule_based_items(family_size: int, duration_days: int, categories: list, is_veg: bool) -> List[GroceryItem]:
    """Deterministic staple generator for Indian households."""
    person_days = max(1, family_size) * max(1, duration_days)
    scale = person_days / 28.0  # Normalized to baseline family of 4 for 7 days

    items = []

    # Grains staples
    if not categories or any(c.lower() in ["grains", "all"] for c in categories):
        items.append(
            GroceryItem(
                name="Wheat Atta / Chakki Fresh",
                category="Grains",
                estimated_quantity=max(1.0, round(5.0 * scale, 1)),
                unit="kg",
                priority="essential",
                reason="Primary staple for daily rotis and flatbreads",
            )
        )
        items.append(
            GroceryItem(
                name="Basmati Rice",
                category="Grains",
                estimated_quantity=max(1.0, round(2.5 * scale, 1)),
                unit="kg",
                priority="essential",
                reason="Staple grain for lunches and dinners",
            )
        )
        items.append(
            GroceryItem(
                name="Toor Dal",
                category="Grains",
                estimated_quantity=max(0.5, round(1.0 * scale, 1)),
                unit="kg",
                priority="essential",
                reason="Key source of protein in daily meals",
            )
        )

    # Dairy staples
    if not categories or any(c.lower() in ["dairy", "all"] for c in categories):
        items.append(
            GroceryItem(
                name="Fresh Milk",
                category="Dairy",
                estimated_quantity=max(1.0, round(7.0 * scale, 1)),
                unit="litres",
                priority="essential",
                reason="Daily tea, coffee, and household milk consumption",
            )
        )
        items.append(
            GroceryItem(
                name="Curd / Dahi",
                category="Dairy",
                estimated_quantity=max(0.5, round(1.5 * scale, 1)),
                unit="kg",
                priority="essential",
                reason="Healthy digestive probiotic accompaniment",
            )
        )

    # Vegetables staples
    if not categories or any(c.lower() in ["vegetables", "all"] for c in categories):
        items.append(
            GroceryItem(
                name="Potatoes",
                category="Vegetables",
                estimated_quantity=max(1.0, round(2.5 * scale, 1)),
                unit="kg",
                priority="essential",
                reason="Versatile cooking vegetable used in numerous dishes",
            )
        )
        items.append(
            GroceryItem(
                name="Onions",
                category="Vegetables",
                estimated_quantity=max(1.0, round(2.0 * scale, 1)),
                unit="kg",
                priority="essential",
                reason="Essential base ingredient for Indian curries and gravies",
            )
        )
        items.append(
            GroceryItem(
                name="Tomatoes",
                category="Vegetables",
                estimated_quantity=max(0.5, round(1.5 * scale, 1)),
                unit="kg",
                priority="essential",
                reason="Essential base for gravies, salads, and cooking",
            )
        )

    # Fruits / Breakfast optional
    if any(c.lower() in ["fruits", "all"] for c in categories):
        items.append(
            GroceryItem(
                name="Bananas / Apples",
                category="Fruits",
                estimated_quantity=max(1.0, round(2.0 * scale, 1)),
                unit="kg",
                priority="optional",
                reason="Nutritious fresh seasonal fruits for breakfast and snacking",
            )
        )

    return items


async def grocery_planner_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph node: Formulates realistic grocery list based on validated intent.
    """
    intent = state.get("shopping_intent") or {}
    family_size = int(intent.get("family_size") or 4)
    duration_days = int(intent.get("duration_days") or 7)
    categories = intent.get("categories") or ["Vegetables", "Dairy", "Grains"]
    dietary = intent.get("dietary_preferences") or []
    is_veg = "vegetarian" in [d.lower() for d in dietary]

    raw_items: List[GroceryItem] = []

    try:
        user_prompt = (
            f"Generate an Indian grocery plan for:\n"
            f"- Family size: {family_size} persons\n"
            f"- Duration: {duration_days} days\n"
            f"- Categories: {categories}\n"
            f"- Dietary preferences: {dietary}\n"
            f"- Target budget: ₹{intent.get('budget', 3000)}"
        )
        resp = await llm_service.generate_structured(
            system_prompt=GROCERY_PLANNER_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_model=GroceryItemListResponse,
        )
        raw_items = resp.items
    except Exception as e:
        logger.info(f"LLM grocery planning fallback to rule-based: {e}")
        raw_items = generate_rule_based_items(family_size, duration_days, categories, is_veg)

    # Enforce deterministic quantity validation & sanitation
    sanitized_items = QuantityService.validate_and_sanitize(
        items=raw_items,
        family_size=family_size,
        duration_days=duration_days,
    )

    return {
        "grocery_items": [i.model_dump(mode="json") for i in sanitized_items],
    }

