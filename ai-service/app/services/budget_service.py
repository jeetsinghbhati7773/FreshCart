from decimal import Decimal
from typing import List, Optional, Tuple
from app.schemas.grocery_plan import MatchedProduct, GroceryItem, GroceryPlanResponse


class BudgetService:
    """
    Authoritative calculation engine for grocery plan budgets.
    Uses Python Decimal arithmetic to prevent floating-point inaccuracy.
    """

    @classmethod
    def calculate_plan_budget(
        cls,
        matched_products: List[MatchedProduct],
        grocery_items: List[GroceryItem],
        budget: Optional[Decimal] = None,
    ) -> GroceryPlanResponse:
        """
        Calculates item subtotals, grand total, budget difference, and recommendations.
        """
        total = Decimal("0.0")

        # Sum subtotals using verified database prices and package counts
        for mp in matched_products:
            subtotal = mp.offer_price * Decimal(str(mp.package_count))
            mp.item_subtotal = subtotal
            total += subtotal

        total = round(total, 2)
        suggestions: List[str] = []

        if budget is not None and budget > 0:
            diff = budget - total
            if total <= budget:
                status = "within_budget"
                surplus = budget - total
                if surplus > Decimal("0.0"):
                    suggestions.append(
                        f"Your plan is ₹{surplus} under budget! You can add extra fresh fruits or treats if desired."
                    )
            else:
                status = "exceeded"
                overrun = total - budget
                # Find optional items or items with the highest subtotals
                optional_names = {
                    item.name.lower()
                    for item in grocery_items
                    if item.priority == "optional"
                }
                costly_items = sorted(
                    matched_products,
                    key=lambda p: p.item_subtotal,
                    reverse=True,
                )

                optional_matches = [
                    p for p in costly_items
                    if p.grocery_item_name.lower() in optional_names
                ]

                suggestions.append(
                    f"Your plan of ₹{total} exceeds your budget of ₹{budget} by ₹{overrun}."
                )

                if optional_matches:
                    opt_names = ", ".join([p.product_name for p in optional_matches[:2]])
                    suggestions.append(
                        f"Consider removing optional items like {opt_names} to save up to ₹"
                        f"{sum(p.item_subtotal for p in optional_matches[:2])}."
                    )
                elif costly_items:
                    most_expensive = costly_items[0]
                    suggestions.append(
                        f"The single largest expense is '{most_expensive.product_name}' (₹{most_expensive.item_subtotal}). "
                        "You can reduce its quantity or substitute with a lower-cost alternative."
                    )
        else:
            status = "not_specified"
            diff = Decimal("0.0")

        return GroceryPlanResponse(
            items=grocery_items,
            matched_products=matched_products,
            estimated_total=total,
            budget=budget,
            budget_difference=diff,
            budget_status=status,
            suggestions=suggestions,
        )


budget_service = BudgetService()

