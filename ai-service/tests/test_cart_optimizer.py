from decimal import Decimal
import pytest
from app.optimization.budget_optimizer import BudgetOptimizer
from app.optimization.optimization_models import OptimizedItem


def test_calculate_cost_breakdown_within_budget():
    items = [
        OptimizedItem(
            requirement_name="Milk",
            product_id="p1",
            product_name="Amul Milk 1L",
            category="Dairy",
            unit_price=Decimal("55"),
            mrp_price=Decimal("60"),
            package_count=2,
            required_quantity=2.0,
            required_unit="litres",
            supplied_quantity=2.0,
            excess_quantity=0.0,
            excess_percentage=0.0,
            subtotal=Decimal("110"),
            is_in_stock=True,
            available_stock=50,
            stock_sufficient=True,
            selection_reason="Best match",
        ),
        OptimizedItem(
            requirement_name="Atta",
            product_id="p2",
            product_name="Aashirvaad Atta 5kg",
            category="Grains",
            unit_price=Decimal("210"),
            mrp_price=Decimal("240"),
            package_count=1,
            required_quantity=5.0,
            required_unit="kg",
            supplied_quantity=5.0,
            excess_quantity=0.0,
            excess_percentage=0.0,
            subtotal=Decimal("210"),
            is_in_stock=True,
            available_stock=50,
            stock_sufficient=True,
            selection_reason="Best match",
        ),
    ]

    breakdown = BudgetOptimizer.calculate_cost_breakdown(
        items=items,
        budget=Decimal("500"),
    )

    # 110 + 210 = 320
    assert breakdown.subtotal == Decimal("320.00")
    assert breakdown.mrp_total == Decimal("360.00")
    assert breakdown.total_savings == Decimal("40.00")
    assert breakdown.final_total == Decimal("320.00")
    assert breakdown.budget_status == "within_budget"
    assert breakdown.remaining_budget == Decimal("180.00")


def test_optimize_selection_budget_swap():
    # Setup candidate map where initial product is expensive (₹350), but a budget option exists (₹180)
    candidate_map = {
        "Basmati Rice": [
            {
                "product": {
                    "id": "rice-exp",
                    "name": "Luxury Royal Basmati Rice 1kg",
                    "category": "Grains",
                    "offerPrice": 350,
                    "price": 400,
                    "stockQuantity": 50,
                    "inStock": True,
                    "unit": "1kg",
                },
                "packages_needed": 1,
                "package_size": 1.0,
                "scores": {"semantic": 0.95},
            },
            {
                "product": {
                    "id": "rice-budget",
                    "name": "Everyday Basmati Rice 1kg",
                    "category": "Grains",
                    "offerPrice": 180,
                    "price": 200,
                    "stockQuantity": 50,
                    "inStock": True,
                    "unit": "1kg",
                },
                "packages_needed": 1,
                "package_size": 1.0,
                "scores": {"semantic": 0.85},
            },
        ]
    }

    req_items = [
        {"name": "Basmati Rice", "estimated_quantity": 1.0, "unit": "kg", "priority": "essential"}
    ]

    # Target budget is ₹250 (less than ₹350 initial, but covers ₹180)
    selected_items, unresolved, recommendations = BudgetOptimizer.optimize_selection(
        candidate_map=candidate_map,
        requirement_items=req_items,
        budget=Decimal("250"),
    )

    assert len(selected_items) == 1
    chosen = selected_items[0]
    # Optimizer should have automatically swapped to the budget option
    assert chosen.product_id == "rice-budget"
    assert chosen.subtotal == Decimal("180")
    assert chosen.is_substitution is True
    assert "saved" in chosen.selection_reason.lower()

