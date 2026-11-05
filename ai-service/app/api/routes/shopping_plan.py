from decimal import Decimal
import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import PlanRequest
from app.schemas.grocery_plan import GroceryItem, GroceryPlanResponse
from app.services.quantity_service import QuantityService
from app.services.catalog_service import catalog_service
from app.services.budget_service import budget_service
from app.agents.nodes.grocery_planner import generate_rule_based_items

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["Shopping Plan"])


@router.post("/plan", response_model=GroceryPlanResponse)
async def generate_plan_endpoint(payload: PlanRequest):
    """
    Direct endpoint to generate or recalculate grocery plan and catalog matching
    given a validated ShoppingIntent.
    """
    intent = payload.intent
    fam = intent.family_size or 4
    dur = intent.duration_days or 7
    categories = intent.categories or ["Vegetables", "Dairy", "Grains"]
    is_veg = "vegetarian" in [d.lower() for d in intent.dietary_preferences]

    try:
        # Generate staples
        raw_items = generate_rule_based_items(fam, dur, categories, is_veg)
        sanitized_items = QuantityService.validate_and_sanitize(raw_items, fam, dur)

        # Match to real FreshCart products
        matched_products = []
        for item in sanitized_items:
            match = await catalog_service.match_item_to_product(item)
            if match:
                matched_products.append(match)

        # Validate budget
        plan_response = budget_service.calculate_plan_budget(
            matched_products=matched_products,
            grocery_items=sanitized_items,
            budget=intent.budget,
        )

        return plan_response

    except Exception as e:
        logger.error(f"Error generating plan: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate shopping plan: {str(e)}",
        )

