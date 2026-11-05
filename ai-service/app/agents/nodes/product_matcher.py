import logging
from typing import Any, Dict, List

from app.agents.state import AgentState
from app.schemas.grocery_plan import GroceryItem, MatchedProduct
from app.services.catalog_service import catalog_service

logger = logging.getLogger(__name__)


async def product_matcher_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph node: Connects grocery items to real FreshCart products
    retrieved from Express backend APIs.
    """
    raw_items = state.get("grocery_items") or []
    grocery_items = [GroceryItem(**item) for item in raw_items]

    matched: List[MatchedProduct] = []

    for item in grocery_items:
        match = await catalog_service.match_item_to_product(item)
        if match:
            matched.append(match)
        else:
            logger.info(f"Could not find matching FreshCart product for item '{item.name}'")

    return {
        "matched_products": [m.model_dump(mode="json") for m in matched],
    }

