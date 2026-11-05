import pytest
from decimal import Decimal
from app.schemas.grocery_plan import GroceryItem
from app.services.catalog_service import CatalogService


def test_package_multiplier_calculation():
    service = CatalogService()

    # Case 1: Requirement is 7 litres milk, catalog item is 500ml pack -> should need 14 packs
    milk_item = GroceryItem(
        name="Milk",
        category="Dairy",
        estimated_quantity=7.0,
        unit="litres",
        priority="essential",
        reason="Daily consumption",
    )
    product_500ml = {
        "id": "prod-1",
        "name": "Amul Taaza Toned Milk 500ml",
        "unit": "500ml",
        "offerPrice": 27.0,
        "price": 28.0,
        "stockQuantity": 50,
        "inStock": True,
    }

    count = service.calculate_package_count(milk_item, product_500ml)
    assert count == 14

    # Case 2: Requirement is 5 kg Atta, catalog item is 1kg pack -> should need 5 packs
    atta_item = GroceryItem(
        name="Atta",
        category="Grains",
        estimated_quantity=5.0,
        unit="kg",
        priority="essential",
        reason="Staple",
    )
    product_1kg = {
        "id": "prod-2",
        "name": "Aashirvaad Superior MP Sharbati Atta 1kg",
        "unit": "1kg",
        "offerPrice": 65.0,
        "price": 75.0,
        "stockQuantity": 20,
        "inStock": True,
    }

    count_atta = service.calculate_package_count(atta_item, product_1kg)
    assert count_atta == 5


@pytest.mark.asyncio
async def test_match_item_stock_sufficiency(monkeypatch):
    service = CatalogService()

    # Mock catalog search to return a mock product with low stock
    async def mock_search(query, category=None, limit=10):
        return [
            {
                "id": "mock-p1",
                "name": "Fresh Potatoes 1kg",
                "category": "Vegetables",
                "unit": "1kg",
                "offerPrice": 35.0,
                "price": 40.0,
                "stockQuantity": 2, # Only 2 packs in stock
                "inStock": True,
                "image": ["https://example.com/potato.jpg"],
            }
        ]

    monkeypatch.setattr(service, "search_products", mock_search)

    item = GroceryItem(
        name="Potatoes",
        category="Vegetables",
        estimated_quantity=5.0, # Needs 5 packs, but only 2 in stock
        unit="kg",
        priority="essential",
        reason="Cooking",
    )

    matched = await service.match_item_to_product(item)
    assert matched is not None
    assert matched.product_name == "Fresh Potatoes 1kg"
    assert matched.available_stock == 2
    assert matched.package_count == 2 # Capped at available stock
    assert matched.stock_sufficient is False
    assert "Requested 5 packs, but only 2 available" in matched.shortage_note

