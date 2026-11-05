import pytest
from decimal import Decimal
from app.schemas.grocery_plan import GroceryItem, MatchedProduct
from app.services.budget_service import BudgetService


def test_budget_within_limit():
    service = BudgetService()
    items = [
        GroceryItem(name="Rice", category="Grains", estimated_quantity=2, unit="kg", priority="essential", reason="staple"),
        GroceryItem(name="Milk", category="Dairy", estimated_quantity=5, unit="litres", priority="essential", reason="daily"),
    ]
    matches = [
        MatchedProduct(
            grocery_item_name="Rice",
            product_id="p-1",
            product_name="Basmati Rice 1kg",
            category="Grains",
            offer_price=Decimal("120.00"),
            mrp_price=Decimal("140.00"),
            package_count=2,
            item_subtotal=Decimal("240.00"),
            in_stock=True,
            available_stock=50,
        ),
        MatchedProduct(
            grocery_item_name="Milk",
            product_id="p-2",
            product_name="Amul Milk 500ml",
            category="Dairy",
            offer_price=Decimal("30.00"),
            mrp_price=Decimal("32.00"),
            package_count=10,
            item_subtotal=Decimal("300.00"),
            in_stock=True,
            available_stock=50,
        ),
    ]

    budget = Decimal("1000.00")
    plan = service.calculate_plan_budget(matches, items, budget)

    assert plan.estimated_total == Decimal("540.00")
    assert plan.budget_status == "within_budget"
    assert plan.budget_difference == Decimal("460.00")
    assert any("under budget" in s for s in plan.suggestions)


def test_budget_exceeded():
    service = BudgetService()
    items = [
        GroceryItem(name="Atta", category="Grains", estimated_quantity=5, unit="kg", priority="essential", reason="staple"),
        GroceryItem(name="Chocolates", category="Snacks", estimated_quantity=2, unit="packs", priority="optional", reason="snack"),
    ]
    matches = [
        MatchedProduct(
            grocery_item_name="Atta",
            product_id="p-1",
            product_name="Aashirvaad Atta 5kg",
            category="Grains",
            offer_price=Decimal("250.00"),
            mrp_price=Decimal("280.00"),
            package_count=1,
            item_subtotal=Decimal("250.00"),
            in_stock=True,
            available_stock=50,
        ),
        MatchedProduct(
            grocery_item_name="Chocolates",
            product_id="p-2",
            product_name="Cadbury Celebration Box",
            category="Snacks",
            offer_price=Decimal("400.00"),
            mrp_price=Decimal("450.00"),
            package_count=2,
            item_subtotal=Decimal("800.00"),
            in_stock=True,
            available_stock=50,
        ),
    ]

    budget = Decimal("800.00")
    plan = service.calculate_plan_budget(matches, items, budget)

    # Total: 250 + 800 = 1050
    assert plan.estimated_total == Decimal("1050.00")
    assert plan.budget_status == "exceeded"
    assert plan.budget_difference == Decimal("-250.00")
    # Should identify optional items (Chocolates) to remove
    assert any("optional" in s.lower() or "cadbury" in s.lower() for s in plan.suggestions)

