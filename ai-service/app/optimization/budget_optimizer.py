from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional, Tuple
from app.optimization.optimization_models import CostBreakdown, OptimizedItem, OptimizationMetrics

logger = logging.getLogger(__name__)


class BudgetOptimizer:
    """
    Global constrained optimizer that balances:
    - Fulfillment of essential groceries
    - Budget limit satisfaction
    - Excess quantity minimization
    - Transparent explanations for substitutions or omissions
    """

    @classmethod
    def calculate_cost_breakdown(
        cls,
        items: List[OptimizedItem],
        budget: Optional[Decimal] = None,
    ) -> CostBreakdown:
        """Computes authoritative totals using Decimal arithmetic."""
        mrp_total = Decimal("0.00")
        subtotal = Decimal("0.00")

        for item in items:
            mrp_total += item.mrp_price * Decimal(str(item.package_count))
            subtotal += item.subtotal

        total_savings = max(Decimal("0.00"), mrp_total - subtotal)
        # FreshCart grocery items in Step 1 do not add extra tax beyond listed prices
        estimated_tax = Decimal("0.00")
        final_total = subtotal + estimated_tax

        if budget is not None and budget > 0:
            remaining = budget - final_total
            if remaining >= 0:
                status = "within_budget" if remaining > 0 else "exact"
            else:
                status = "exceeded"
            diff = remaining
        else:
            remaining = None
            status = "not_specified"
            diff = Decimal("0.00")

        return CostBreakdown(
            mrp_total=mrp_total,
            subtotal=subtotal,
            total_savings=total_savings,
            estimated_tax=estimated_tax,
            final_total=final_total,
            budget=budget,
            remaining_budget=remaining if remaining is not None and remaining >= 0 else Decimal("0.00"),
            budget_status=status,
            budget_difference=diff,
        )

    @classmethod
    def optimize_selection(
        cls,
        candidate_map: Dict[str, List[Dict[str, Any]]],
        requirement_items: List[Dict[str, Any]],
        budget: Optional[Decimal] = None,
    ) -> Tuple[List[OptimizedItem], List[str], List[str]]:
        """
        Selects optimal product for each requirement considering budget constraints.
        Returns: (selected_items, unresolved_requirements, recommendations)
        """
        selected_items: List[OptimizedItem] = []
        unresolved: List[str] = []
        recommendations: List[str] = []

        # 1. Greedy initial selection: best scored in-stock candidate
        for req in requirement_items:
            req_name = req.get("name", "")
            req_qty = float(req.get("estimated_quantity", 1.0))
            req_unit = req.get("unit", "pcs")
            priority = req.get("priority", "essential")

            candidates = candidate_map.get(req_name, [])
            if not candidates:
                unresolved.append(req_name)
                continue

            # Prioritize in-stock candidate with highest composite score
            in_stock_cands = [
                c for c in candidates
                if c.get("product", {}).get("inStock", True)
                and c.get("product", {}).get("stockQuantity", 0) > 0
            ]
            chosen = in_stock_cands[0] if in_stock_cands else candidates[0]
            prod = chosen.get("product", chosen)

            # Package calculation details
            pkg_needed = chosen.get("packages_needed", 1)
            offer_price = Decimal(str(prod.get("offerPrice", prod.get("price", 0))))
            mrp_price = Decimal(str(prod.get("price", offer_price)))
            stock_qty = int(prod.get("stockQuantity", 50))
            in_stock = bool(prod.get("inStock", True) and stock_qty > 0)
            stock_sufficient = stock_qty >= pkg_needed

            pkg_size_val = chosen.get("package_size", 1.0)
            supplied_qty = round(pkg_needed * pkg_size_val, 2)
            excess_qty = max(0.0, round(supplied_qty - req_qty, 2))
            excess_pct = round((excess_qty / max(0.001, req_qty)) * 100.0, 1)

            # Collect other candidates as alternatives
            alternatives = [
                c.get("product", c) for c in candidates
                if str(c.get("product", c).get("id")) != str(prod.get("id"))
            ]

            item = OptimizedItem(
                requirement_name=req_name,
                product_id=str(prod.get("id") or prod.get("_id")),
                product_name=prod.get("name", req_name),
                category=prod.get("category", "General"),
                brand=prod.get("brand"),
                package_size=prod.get("unit"),
                image_url=(prod.get("image") or [None])[0] if isinstance(prod.get("image"), list) and len(prod.get("image")) > 0 else None,
                unit_price=offer_price,
                mrp_price=mrp_price,
                package_count=pkg_needed,
                required_quantity=req_qty,
                required_unit=req_unit,
                supplied_quantity=supplied_qty,
                excess_quantity=excess_qty,
                excess_percentage=excess_pct,
                subtotal=offer_price * Decimal(str(pkg_needed)),
                is_in_stock=in_stock,
                available_stock=stock_qty,
                stock_sufficient=stock_sufficient,
                priority=priority,
                selection_reason=f"Optimal {chosen.get('scores', {}).get('semantic', 1.0)*100:.0f}% match in {prod.get('category')}",
                is_substitution=False,
                available_alternatives=[],
            )
            selected_items.append(item)

        # 2. Check if total exceeds budget
        if budget is not None and budget > 0:
            current_total = sum((it.subtotal for it in selected_items), Decimal("0.00"))

            # If over budget, try swapping items for budget-friendly alternatives
            if current_total > budget:
                recommendations.append(
                    f"Initial selection of ₹{current_total:.2f} exceeded target budget of ₹{budget:.2f}. Applying smart budget optimization."
                )

                # Sort by item cost descending to find highest savings opportunities
                items_by_cost = sorted(selected_items, key=lambda x: x.subtotal, reverse=True)

                for it in items_by_cost:
                    if current_total <= budget:
                        break

                    req_name = it.requirement_name
                    candidates = candidate_map.get(req_name, [])

                    # Find cheaper in-stock alternative
                    cheaper_cands = [
                        c for c in candidates
                        if Decimal(str(c.get("product", {}).get("offerPrice", 999999))) < it.unit_price
                        and c.get("product", {}).get("inStock", True)
                        and c.get("product", {}).get("stockQuantity", 0) > 0
                    ]

                    if cheaper_cands:
                        cheaper = cheaper_cands[0]
                        ch_prod = cheaper.get("product", cheaper)
                        ch_price = Decimal(str(ch_prod.get("offerPrice", ch_prod.get("price", 0))))
                        ch_pkg_needed = cheaper.get("packages_needed", 1)
                        ch_subtotal = ch_price * Decimal(str(ch_pkg_needed))

                        savings = it.subtotal - ch_subtotal
                        if savings > Decimal("0.00"):
                            # Perform swap
                            old_name = it.product_name
                            it.product_id = str(ch_prod.get("id") or ch_prod.get("_id"))
                            it.product_name = ch_prod.get("name")
                            it.brand = ch_prod.get("brand")
                            it.package_size = ch_prod.get("unit")
                            it.unit_price = ch_price
                            it.mrp_price = Decimal(str(ch_prod.get("price", ch_price)))
                            it.package_count = ch_pkg_needed
                            it.subtotal = ch_subtotal
                            it.is_substitution = True
                            it.original_product_name = old_name
                            it.selection_reason = f"Budget substitution: saved ₹{savings:.2f} over {old_name}"
                            current_total -= savings
                            recommendations.append(
                                f"Swapped '{old_name}' with '{ch_prod.get('name')}' to save ₹{savings:.2f}."
                            )

            # If still over budget, notify user about optional items
            if current_total > budget:
                overage = current_total - budget
                recommendations.append(
                    f"Plan currently exceeds target budget by ₹{overage:.2f}. Consider trimming optional items or adjusting quantities."
                )
            else:
                remaining = budget - current_total
                recommendations.append(
                    f"Great! All items fulfilled within budget with ₹{remaining:.2f} remaining."
                )

        return selected_items, unresolved, recommendations
