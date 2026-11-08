from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional
import httpx

from app.config import settings
from app.discovery.product_discovery import product_discovery_engine
from app.discovery.alternative_finder import alternative_finder
from app.optimization.optimization_models import (
    CostBreakdown,
    OptimizedCart,
    OptimizedItem,
    OptimizationMetrics,
    OptimizationRequest,
    SwapItemRequest,
)
from app.optimization.budget_optimizer import BudgetOptimizer
from app.optimization.package_optimizer import PackageOptimizer

logger = logging.getLogger(__name__)


class CartOptimizerService:
    """
    High-level orchestrator for Step 3:
    Converts grocery plan requirements into an optimized shopping cart
    with multi-candidate discovery, package sizing, alternative classification,
    and budget optimization.
    """

    @classmethod
    async def optimize_cart(cls, request: OptimizationRequest) -> OptimizedCart:
        """
        Executes full discovery and optimization pipeline for grocery requirements.
        """
        candidate_map: Dict[str, List[Dict[str, Any]]] = {}

        # 1. Multi-candidate discovery for each grocery item
        for req in request.grocery_items:
            req_name = req.get("name", "")
            req_qty = float(req.get("estimated_quantity", 1.0))
            req_unit = req.get("unit", "pcs")
            category = req.get("category")

            candidates = await product_discovery_engine.discover_candidates(
                requirement_name=req_name,
                estimated_quantity=req_qty,
                unit=req_unit,
                category=category,
                preferred_brands=request.preferred_brands,
                max_candidates=5,
            )
            candidate_map[req_name] = candidates

        # 2. Budget-constrained optimization
        selected_items, unresolved, recommendations = BudgetOptimizer.optimize_selection(
            candidate_map=candidate_map,
            requirement_items=request.grocery_items,
            budget=request.budget,
        )

        # 3. Attach classified alternatives for each item
        for it in selected_items:
            candidates = candidate_map.get(it.requirement_name, [])
            current_prod_dict = {
                "id": it.product_id,
                "name": it.product_name,
                "category": it.category,
                "brand": it.brand,
                "offerPrice": float(it.unit_price),
                "price": float(it.mrp_price),
                "stockQuantity": it.available_stock,
                "inStock": it.is_in_stock,
            }
            alts = alternative_finder.find_alternatives(
                original_product=current_prod_dict,
                candidates=candidates,
                required_quantity=it.required_quantity,
                required_unit=it.required_unit,
                dietary_preferences=request.dietary_preferences,
                max_alternatives=4,
            )
            it.available_alternatives = alts

        # 4. Compute cost breakdown
        breakdown = BudgetOptimizer.calculate_cost_breakdown(
            items=selected_items,
            budget=request.budget,
        )

        # 5. Compute metrics
        total_reqs = len(request.grocery_items)
        fulfilled = len(selected_items)
        total_packs = sum(it.package_count for it in selected_items)
        avg_excess = (
            sum(it.excess_percentage for it in selected_items) / max(1, fulfilled)
            if fulfilled > 0
            else 0.0
        )
        substitutions = sum(1 for it in selected_items if it.is_substitution)

        metrics = OptimizationMetrics(
            total_requirements=total_reqs,
            fulfilled_requirements=fulfilled,
            unresolved_requirements=len(unresolved),
            total_packages=total_packs,
            average_excess_percentage=round(avg_excess, 1),
            substitutions_made=substitutions,
        )

        return OptimizedCart(
            conversation_id=request.conversation_id or "default-session",
            items=selected_items,
            unresolved_items=unresolved,
            breakdown=breakdown,
            metrics=metrics,
            recommendations=recommendations,
        )

    @classmethod
    async def swap_item(cls, request: SwapItemRequest) -> OptimizedCart:
        """
        Replaces target product with replacement product and recomputes cart metrics.
        """
        cart = request.current_cart
        target_id = request.target_product_id
        rep_id = request.replacement_product_id

        # Fetch replacement product from Express
        rep_product = None
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(
                    f"{settings.EXPRESS_API_BASE_URL.rstrip('/')}/api/internal/ai/products/{rep_id}",
                    headers={"x-internal-api-key": settings.INTERNAL_API_KEY},
                )
                if res.status_code == 200:
                    rep_product = res.json().get("product")
            except Exception as e:
                logger.error(f"Failed to fetch replacement product {rep_id}: {e}")

        if not rep_product:
            raise ValueError(f"Replacement product '{rep_id}' could not be verified in FreshCart catalog.")

        updated_items = []
        for it in cart.items:
            if it.product_id == target_id:
                # Recalculate package math for replacement product
                pkg_res = PackageOptimizer.calculate_packages(
                    required_quantity=it.required_quantity,
                    required_unit=it.required_unit,
                    product=rep_product,
                )

                offer_price = Decimal(str(rep_product.get("offerPrice", rep_product.get("price", 0))))
                mrp_price = Decimal(str(rep_product.get("price", offer_price)))
                stock_qty = int(rep_product.get("stockQuantity", 50))
                in_stock = bool(rep_product.get("inStock", True) and stock_qty > 0)
                subtotal = offer_price * Decimal(str(pkg_res.required_packages))

                new_item = OptimizedItem(
                    requirement_name=it.requirement_name,
                    product_id=rep_id,
                    product_name=rep_product.get("name"),
                    category=rep_product.get("category", it.category),
                    brand=rep_product.get("brand"),
                    package_size=rep_product.get("unit"),
                    image_url=(rep_product.get("image") or [None])[0] if isinstance(rep_product.get("image"), list) and len(rep_product.get("image")) > 0 else None,
                    unit_price=offer_price,
                    mrp_price=mrp_price,
                    package_count=pkg_res.required_packages,
                    required_quantity=it.required_quantity,
                    required_unit=it.required_unit,
                    supplied_quantity=pkg_res.supplied_quantity,
                    excess_quantity=pkg_res.excess_quantity,
                    excess_percentage=pkg_res.excess_percentage,
                    subtotal=subtotal,
                    is_in_stock=in_stock,
                    available_stock=stock_qty,
                    stock_sufficient=stock_qty >= pkg_res.required_packages,
                    priority=it.priority,
                    selection_reason=f"Customer selected swap to {rep_product.get('name')}",
                    is_substitution=True,
                    original_product_name=it.product_name,
                    available_alternatives=it.available_alternatives,
                )
                updated_items.append(new_item)
            else:
                updated_items.append(it)

        # Recompute breakdown and metrics
        new_breakdown = BudgetOptimizer.calculate_cost_breakdown(
            items=updated_items,
            budget=cart.breakdown.budget,
        )

        total_reqs = len(updated_items) + len(cart.unresolved_items)
        fulfilled = len(updated_items)
        total_packs = sum(it.package_count for it in updated_items)
        avg_excess = (
            sum(it.excess_percentage for it in updated_items) / max(1, fulfilled)
            if fulfilled > 0
            else 0.0
        )
        substitutions = sum(1 for it in updated_items if it.is_substitution)

        new_metrics = OptimizationMetrics(
            total_requirements=total_reqs,
            fulfilled_requirements=fulfilled,
            unresolved_requirements=len(cart.unresolved_items),
            total_packages=total_packs,
            average_excess_percentage=round(avg_excess, 1),
            substitutions_made=substitutions,
        )

        return OptimizedCart(
            conversation_id=cart.conversation_id,
            items=updated_items,
            unresolved_items=cart.unresolved_items,
            breakdown=new_breakdown,
            metrics=new_metrics,
            recommendations=cart.recommendations,
        )


cart_optimizer_service = CartOptimizerService()
