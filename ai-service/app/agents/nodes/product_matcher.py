import asyncio
import logging
from typing import Any, Dict, List

from app.agents.state import AgentState
from app.schemas.grocery_plan import GroceryItem, MatchedProduct
from app.services.catalog_service import catalog_service

logger = logging.getLogger(__name__)


async def product_matcher_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph node: Connects grocery items to real FreshCart products
    retrieved concurrently from Express backend APIs.
    """
    raw_items = state.get("grocery_items") or []
    grocery_items = [GroceryItem(**item) for item in raw_items]

    # Concurrent parallel matching for instant resolution
    matches = await asyncio.gather(
        *[catalog_service.match_item_to_product(item) for item in grocery_items],
        return_exceptions=True
    )

    matched: List[MatchedProduct] = [
        m for m in matches if isinstance(m, MatchedProduct) and m is not None
    ]

    return {
        "matched_products": [m.model_dump(mode="json") for m in matched],
    }

