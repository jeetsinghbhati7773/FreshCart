from decimal import Decimal
import pytest
from app.optimization.package_optimizer import PackageOptimizer


def test_package_calculation_exact_match():
    product = {
        "id": "p1",
        "name": "Tata Salt 1kg",
        "unit": "1kg",
        "offerPrice": 28,
        "price": 30,
        "stockQuantity": 100,
        "inStock": True,
    }
    res = PackageOptimizer.calculate_packages(
        required_quantity=1.0,
        required_unit="kg",
        product=product,
    )

    assert res.required_packages == 1
    assert res.supplied_quantity == 1.0
    assert res.excess_quantity == 0.0
    assert res.excess_percentage == 0.0
    assert res.subtotal == Decimal("28")
    assert res.is_in_stock is True
    assert res.shortage_packages == 0


def test_package_calculation_fractional_requirement():
    # Needing 2.5kg Potatoes, buying 1kg bags
    product = {
        "id": "p2",
        "name": "Fresh Potato 1kg",
        "unit": "1kg",
        "offerPrice": 40,
        "price": 50,
        "stockQuantity": 20,
        "inStock": True,
    }
    res = PackageOptimizer.calculate_packages(
        required_quantity=2.5,
        required_unit="kg",
        product=product,
    )

    # ceil(2.5 / 1.0) = 3 packages
    assert res.required_packages == 3
    assert res.supplied_quantity == 3.0
    assert res.excess_quantity == 0.5
    assert res.excess_percentage == 20.0
    assert res.subtotal == Decimal("120")
    assert res.shortage_packages == 0


def test_package_calculation_unit_conversion():
    # Needing 2 litres Milk, packaging is 500ml (0.5L)
    product = {
        "id": "p3",
        "name": "Amul Taaza Milk 500ml",
        "unit": "500ml",
        "offerPrice": 27,
        "price": 28,
        "stockQuantity": 30,
        "inStock": True,
    }
    res = PackageOptimizer.calculate_packages(
        required_quantity=2.0,
        required_unit="litres",
        product=product,
    )

    # ceil(2.0 / 0.5) = 4 packages
    assert res.required_packages == 4
    assert res.supplied_quantity == 2.0
    assert res.excess_quantity == 0.0
    assert res.subtotal == Decimal("108")


def test_package_calculation_stock_limitation():
    # Needing 10 packs, but only 4 in stock
    product = {
        "id": "p4",
        "name": "Rare Basmati Rice 1kg",
        "unit": "1kg",
        "offerPrice": 150,
        "price": 180,
        "stockQuantity": 4,
        "inStock": True,
    }
    res = PackageOptimizer.calculate_packages(
        required_quantity=10.0,
        required_unit="kg",
        product=product,
    )

    assert res.required_packages == 10
    assert res.fulfillable_packages == 4
    assert res.shortage_packages == 6
    assert res.subtotal == Decimal("600")  # 4 * 150
