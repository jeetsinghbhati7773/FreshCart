import pytest
from app.discovery.product_normalizer import ProductNormalizer
from app.discovery.product_scorer import ProductScorer


def test_clean_query_text():
    assert ProductNormalizer.clean_query_text("Curd (Plain Yogurt)") == "Curd"
    assert ProductNormalizer.clean_query_text("Atta (Whole Wheat Flour)") == "Atta"
    assert ProductNormalizer.clean_query_text("Rice (Basmati / Long Grain)") == "Rice"
    assert ProductNormalizer.clean_query_text("Fresh Milk 1L") == "Fresh Milk 1L"


def test_singularize():
    assert ProductNormalizer.singularize("Potatoes") == "potato"
    assert ProductNormalizer.singularize("Tomatoes") == "tomato"
    assert ProductNormalizer.singularize("Onions") == "onion"
    assert ProductNormalizer.singularize("Apples") == "apple"
    assert ProductNormalizer.singularize("Eggs") == "egg"
    assert ProductNormalizer.singularize("Milk") == "milk"
    assert ProductNormalizer.singularize("Rice") == "rice"


def test_parse_package_size():
    size, unit = ProductNormalizer.parse_package_size("1kg", "Aashirvaad Atta 1kg")
    assert size == 1.0
    assert unit == "kg"

    size_g, unit_g = ProductNormalizer.parse_package_size("500g", "Amul Butter 500g")
    assert size_g == 0.5
    assert unit_g == "kg"

    size_l, unit_l = ProductNormalizer.parse_package_size("1 L", "Amul Milk 1 L Tetra Pak")
    assert size_l == 1.0
    assert unit_l == "litres"

    size_ml, unit_ml = ProductNormalizer.parse_package_size("500ml", "Mother Dairy Milk 500ml")
    assert size_ml == 0.5
    assert unit_ml == "litres"


def test_standardize_quantity():
    qty_kg, u_kg = ProductNormalizer.standardize_quantity(500.0, "g")
    assert qty_kg == 0.5
    assert u_kg == "kg"

    qty_l, u_l = ProductNormalizer.standardize_quantity(1500.0, "ml")
    assert qty_l == 1.5
    assert u_l == "litres"


def test_product_scorer():
    sample_candidate = {
        "id": "prod-1",
        "name": "Aashirvaad Superior MP Whole Wheat Atta 5kg",
        "category": "Grains",
        "brand": "Aashirvaad",
        "offerPrice": 210,
        "price": 240,
        "stockQuantity": 50,
        "inStock": True,
        "unit": "5kg",
    }

    score_result = ProductScorer.score_candidate(
        candidate=sample_candidate,
        requirement_name="Atta",
        req_quantity=5.0,
        req_unit="kg",
        req_category="Grains",
        preferred_brands=["Aashirvaad"],
    )

    assert score_result["composite_score"] > 0.7
    assert score_result["scores"]["semantic"] >= 0.7
    assert score_result["scores"]["category"] == 1.0
    assert score_result["scores"]["brand"] == 1.0
    assert score_result["packages_needed"] == 1
