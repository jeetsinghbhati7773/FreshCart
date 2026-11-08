from decimal import Decimal
import pytest
from app.discovery.alternative_finder import AlternativeFinder


def test_classify_exact_alternative():
    original = {
        "id": "p1",
        "name": "Amul Taaza Toned Milk 1L",
        "category": "Dairy",
        "offerPrice": 56,
        "price": 58,
        "unit": "1L",
        "stockQuantity": 0,  # Out of stock
        "inStock": False,
    }
    candidate = {
        "id": "p2",
        "name": "Mother Dairy Toned Milk 1L",
        "category": "Dairy",
        "offerPrice": 56,
        "price": 58,
        "unit": "1L",
        "stockQuantity": 20,
        "inStock": True,
    }

    alt = AlternativeFinder.classify_candidate(
        original_product=original,
        candidate_product=candidate,
        required_quantity=1.0,
        required_unit="litres",
    )

    assert alt is not None
    assert alt.classification == "exact"
    assert alt.price_difference == Decimal("0.00")


def test_classify_budget_friendly_alternative():
    original = {
        "id": "p1",
        "name": "India Gate Super Basmati Rice 1kg",
        "category": "Grains",
        "offerPrice": 180,
        "price": 200,
        "unit": "1kg",
        "stockQuantity": 10,
        "inStock": True,
    }
    candidate = {
        "id": "p2",
        "name": "Fortune Rozana Basmati Rice 1kg",
        "category": "Grains",
        "offerPrice": 95,
        "price": 120,
        "unit": "1kg",
        "stockQuantity": 25,
        "inStock": True,
    }

    alt = AlternativeFinder.classify_candidate(
        original_product=original,
        candidate_product=candidate,
        required_quantity=1.0,
        required_unit="kg",
    )

    assert alt is not None
    assert alt.classification == "budget_friendly"
    assert alt.price_difference < Decimal("0.00")
    assert "saving" in alt.reason.lower()


def test_reject_cross_category_substitution():
    original = {
        "id": "p1",
        "name": "Basmati Rice 1kg",
        "category": "Grains",
        "offerPrice": 120,
        "price": 140,
        "unit": "1kg",
        "stockQuantity": 0,
        "inStock": False,
    }
    candidate = {
        "id": "p2",
        "name": "Fresh Milk 1L",
        "category": "Dairy",
        "offerPrice": 55,
        "price": 60,
        "unit": "1L",
        "stockQuantity": 30,
        "inStock": True,
    }

    alt = AlternativeFinder.classify_candidate(
        original_product=original,
        candidate_product=candidate,
        required_quantity=1.0,
        required_unit="kg",
    )

    # Rejection of incompatible category
    assert alt is None


def test_reject_out_of_stock_candidate():
    original = {
        "id": "p1",
        "name": "Tata Salt 1kg",
        "category": "Spices",
        "offerPrice": 28,
        "price": 30,
        "unit": "1kg",
        "stockQuantity": 0,
        "inStock": False,
    }
    candidate = {
        "id": "p2",
        "name": "Catch Salt 1kg",
        "category": "Spices",
        "offerPrice": 25,
        "price": 28,
        "unit": "1kg",
        "stockQuantity": 0,  # Also out of stock
        "inStock": False,
    }

    alt = AlternativeFinder.classify_candidate(
        original_product=original,
        candidate_product=candidate,
        required_quantity=1.0,
        required_unit="kg",
    )

    assert alt is None
