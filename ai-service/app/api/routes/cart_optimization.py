import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.discovery.product_discovery import product_discovery_engine
from app.discovery.alternative_finder import alternative_finder
from app.optimization.optimization_models import (
    OptimizedCart,
    OptimizationRequest,
    SwapItemRequest,
)
from app.optimization.optimizer import cart_optimizer_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["Cart Optimization"])


class DiscoverProductsRequest(BaseModel):
    requirement_name: str
    estimated_quantity: float = 1.0
    unit: str = "pcs"
    category: Optional[str] = None
    preferred_brands: List[str] = []
    max_candidates: int = 5


class FindAlternativesRequest(BaseModel):
    original_product_id: Optional[str] = None
    original_product: Optional[Dict[str, Any]] = None
    required_quantity: float = 1.0
    required_unit: str = "pcs"
    category: Optional[str] = None
    dietary_preferences: List[str] = []
    max_alternatives: int = 4


@router.post("/optimize-cart", response_model=OptimizedCart)
async def optimize_cart_endpoint(payload: OptimizationRequest):
    """
    Step 3 Core Endpoint:
    Discovers candidate products from FreshCart catalog, performs package calculations,
    classifies alternatives, and optimizes the shopping cart under budget constraints.
    """
    try:
        cart = await cart_optimizer_service.optimize_cart(payload)
        return cart
    except Exception as e:
        logger.error(f"Cart optimization error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cart optimization failed: {str(e)}",
        )


@router.post("/reoptimize-cart", response_model=OptimizedCart)
async def reoptimize_cart_endpoint(payload: SwapItemRequest):
    """
    Swaps a selected product with an alternative and dynamically recalculates
    cart totals, savings, package counts, and budget status.
    """
    try:
        updated_cart = await cart_optimizer_service.swap_item(payload)
        return updated_cart
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.error(f"Cart reoptimization swap error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Item swap failed: {str(e)}",
        )


@router.post("/discover-products")
async def discover_products_endpoint(payload: DiscoverProductsRequest):
    """
    Retrieves and ranks multi-candidate catalog products for a single grocery requirement.
    """
    try:
        candidates = await product_discovery_engine.discover_candidates(
            requirement_name=payload.requirement_name,
            estimated_quantity=payload.estimated_quantity,
            unit=payload.unit,
            category=payload.category,
            preferred_brands=payload.preferred_brands,
            max_candidates=payload.max_candidates,
        )
        return {"success": True, "candidates": candidates}
    except Exception as e:
        logger.error(f"Discovery endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Product discovery failed: {str(e)}",
        )


@router.post("/find-alternatives")
async def find_alternatives_endpoint(payload: FindAlternativesRequest):
    """
    Finds and classifies suitable alternatives (exact, similar, budget_friendly, premium)
    for a given product.
    """
    try:
        # First discover candidate alternatives
        cand_list = await product_discovery_engine.discover_candidates(
            requirement_name=payload.original_product.get("name", "") if payload.original_product else "Grocery item",
            estimated_quantity=payload.required_quantity,
            unit=payload.required_unit,
            category=payload.category,
            max_candidates=8,
        )
        alternatives = alternative_finder.find_alternatives(
            original_product=payload.original_product,
            candidates=cand_list,
            required_quantity=payload.required_quantity,
            required_unit=payload.required_unit,
            dietary_preferences=payload.dietary_preferences,
            max_alternatives=payload.max_alternatives,
        )
        return {"success": True, "alternatives": alternatives}
    except Exception as e:
        logger.error(f"Find alternatives error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Alternative search failed: {str(e)}",
        )
