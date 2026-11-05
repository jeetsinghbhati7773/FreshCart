import pytest
from app.agents.nodes.grocery_planner import generate_rule_based_items
from app.services.quantity_service import QuantityService
from app.schemas.grocery_plan import GroceryItem


def test_planner_family_of_two_three_days():
    raw = generate_rule_based_items(family_size=2, duration_days=3, categories=["Grains", "Dairy", "Vegetables"], is_veg=True)
    sanitized = QuantityService.validate_and_sanitize(raw, family_size=2, duration_days=3)

    assert len(sanitized) > 0
    for item in sanitized:
        assert item.estimated_quantity > 0
        assert item.unit in ["kg", "litres", "packs", "pcs", "g", "ml"]
        # Quantities for 2 people 3 days should be modest
        if item.unit == "kg":
            assert item.estimated_quantity <= 5.0


def test_planner_family_of_four_seven_days():
    raw = generate_rule_based_items(family_size=4, duration_days=7, categories=["Grains", "Dairy", "Vegetables"], is_veg=True)
    sanitized = QuantityService.validate_and_sanitize(raw, family_size=4, duration_days=7)

    names = [i.name.lower() for i in sanitized]
    assert any("atta" in n or "wheat" in n for n in names)
    assert any("rice" in n for n in names)
    assert any("milk" in n for n in names)
    assert any("potatoes" in n for n in names)


def test_quantity_service_bounds_clamping():
    # Test that exorbitant quantities proposed by rogue LLM are clamped
    unreasonable = [
        GroceryItem(
            name="Rice",
            category="Grains",
            estimated_quantity=100.0, # 100 kg for 2 people for 3 days is absurd
            unit="kg",
            priority="essential",
            reason="Unreasonable quantity test",
        ),
        GroceryItem(
            name="Milk",
            category="Dairy",
            estimated_quantity=-5.0, # Negative quantity should be fixed
            unit="litres",
            priority="essential",
            reason="Negative quantity test",
        ),
    ]

    sanitized = QuantityService.validate_and_sanitize(unreasonable, family_size=2, duration_days=3)
    assert len(sanitized) == 2

    rice = next(i for i in sanitized if i.name == "Rice")
    assert rice.estimated_quantity < 10.0 # Clamped to reasonable bound

    milk = next(i for i in sanitized if i.name == "Milk")
    assert milk.estimated_quantity > 0.0 # Converted to positive

