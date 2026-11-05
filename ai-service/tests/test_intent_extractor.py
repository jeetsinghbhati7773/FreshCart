import pytest
from decimal import Decimal
from app.agents.nodes.intent_extractor import rule_based_extract
from app.utils.validators import parse_indian_budget


def test_intent_all_details_provided():
    msg = "I need groceries for a family of four for seven days within ₹3,000."
    intent = rule_based_extract(msg)

    assert intent.family_size == 4
    assert intent.duration_days == 7
    assert intent.budget == Decimal("3000")
    assert intent.currency == "INR"
    assert intent.requires_clarification is False
    assert len(intent.missing_fields) == 0


def test_intent_monthly_groceries_two_people():
    msg = "I need monthly groceries for two people."
    intent = rule_based_extract(msg)

    assert intent.family_size == 2
    assert intent.duration_days == 30
    assert intent.budget is None
    assert "budget" in intent.missing_fields
    assert intent.requires_clarification is True


def test_intent_budget_categories():
    msg = "I have Rs. 1500 for vegetables and dairy."
    intent = rule_based_extract(msg)

    assert intent.budget == Decimal("1500")
    assert "Vegetables" in intent.categories
    assert "Dairy" in intent.categories
    assert "family_size" in intent.missing_fields
    assert "duration_days" in intent.missing_fields
    assert intent.requires_clarification is True


def test_intent_vegetarian_five_people():
    msg = "Prepare a vegetarian grocery list for five people."
    intent = rule_based_extract(msg)

    assert intent.family_size == 5
    assert "vegetarian" in intent.dietary_preferences
    assert intent.requires_clarification is True
    assert "budget" in intent.missing_fields


def test_intent_vague_request_triggers_clarification():
    msg = "I need groceries for my family."
    intent = rule_based_extract(msg)

    assert intent.requires_clarification is True
    assert "family_size" in intent.missing_fields
    assert "duration_days" in intent.missing_fields
    assert "budget" in intent.missing_fields


def test_indian_currency_expressions():
    assert parse_indian_budget("₹3000") == Decimal("3000")
    assert parse_indian_budget("Rs. 3000") == Decimal("3000")
    assert parse_indian_budget("3k rupees") == Decimal("3000")
    assert parse_indian_budget("3000 INR") == Decimal("3000")
    assert parse_indian_budget("budget is 2.5k") == Decimal("2500")
    assert parse_indian_budget("₹3,500.50") == Decimal("3500.50")

