import pytest
from decimal import Decimal
from app.agents.graph import shopping_graph
from app.services.catalog_service import catalog_service


@pytest.fixture(autouse=True)
def mock_catalog(monkeypatch):
    async def mock_search(query, category=None, limit=10):
        return [
            {
                "id": "mock-p1",
                "name": f"Fresh {query} 1kg",
                "category": category or "Grains",
                "unit": "1kg",
                "offerPrice": 50.0,
                "price": 60.0,
                "stockQuantity": 50,
                "inStock": True,
                "image": ["https://example.com/img.jpg"],
            }
        ]

    monkeypatch.setattr(catalog_service, "search_products", mock_search)


@pytest.mark.asyncio
async def test_full_request_single_turn():
    """Customer supplies all necessary parameters in a single message."""
    session_id = "test-session-full"
    config = {"configurable": {"thread_id": session_id}}

    initial_state = {
        "conversation_id": session_id,
        "user_id": "test-user-1",
        "current_message": "I need groceries for a family of four for seven days within ₹3,000.",
        "conversation_history": [],
        "shopping_intent": None,
        "clarification_question": None,
        "grocery_items": [],
        "matched_products": [],
        "estimated_total": 0.0,
        "budget_status": "not_calculated",
        "budget_difference": 0.0,
        "suggestions": [],
        "final_response": "",
        "status": "start",
    }

    result = await shopping_graph.ainvoke(initial_state, config=config)

    assert result["status"] == "plan_generated"
    assert result["shopping_intent"]["family_size"] == 4
    assert result["shopping_intent"]["duration_days"] == 7
    assert float(result["shopping_intent"]["budget"]) == 3000.0
    assert len(result["grocery_items"]) > 0
    assert result["clarification_question"] is None


@pytest.mark.asyncio
async def test_multi_turn_conversation_clarification_then_update():
    """Customer begins with vague request, gets clarified, then updates parameters."""
    session_id = "test-session-multi-turn"
    config = {"configurable": {"thread_id": session_id}}

    # Turn 1: Vague request
    turn1_state = {
        "conversation_id": session_id,
        "user_id": "test-user-2",
        "current_message": "I need groceries for my family.",
        "conversation_history": [],
        "shopping_intent": None,
        "clarification_question": None,
        "grocery_items": [],
        "matched_products": [],
        "estimated_total": 0.0,
        "budget_status": "not_calculated",
        "budget_difference": 0.0,
        "suggestions": [],
        "final_response": "",
        "status": "start",
    }

    turn1_result = await shopping_graph.ainvoke(turn1_state, config=config)

    assert turn1_result["status"] == "clarification_needed"
    assert turn1_result["clarification_question"] is not None
    assert turn1_result["shopping_intent"]["requires_clarification"] is True

    # Turn 2: Customer provides missing duration, family size, and budget
    turn2_state = {
        "conversation_id": session_id,
        "user_id": "test-user-2",
        "current_message": "Four people for seven days, with a budget of ₹3,000.",
        "conversation_history": [
            {"role": "user", "content": "I need groceries for my family."},
            {"role": "assistant", "content": turn1_result["clarification_question"]},
        ],
        "shopping_intent": turn1_result["shopping_intent"],
        "clarification_question": None,
        "grocery_items": [],
        "matched_products": [],
        "estimated_total": 0.0,
        "budget_status": "not_calculated",
        "budget_difference": 0.0,
        "suggestions": [],
        "final_response": "",
        "status": "start",
    }

    turn2_result = await shopping_graph.ainvoke(turn2_state, config=config)

    assert turn2_result["status"] == "plan_generated"
    assert turn2_result["shopping_intent"]["family_size"] == 4
    assert turn2_result["shopping_intent"]["duration_days"] == 7
    assert len(turn2_result["grocery_items"]) > 0


@pytest.mark.asyncio
async def test_multi_turn_budget_adjustment():
    """Customer updates existing budget in an active conversation."""
    session_id = "test-session-budget-change"
    config = {"configurable": {"thread_id": session_id}}

    # Initial plan
    state1 = {
        "conversation_id": session_id,
        "user_id": "test-user-3",
        "current_message": "Groceries for 2 people for 3 days with budget ₹1000",
        "conversation_history": [],
        "shopping_intent": None,
        "clarification_question": None,
        "grocery_items": [],
        "matched_products": [],
        "estimated_total": 0.0,
        "budget_status": "not_calculated",
        "budget_difference": 0.0,
        "suggestions": [],
        "final_response": "",
        "status": "start",
    }

    res1 = await shopping_graph.ainvoke(state1, config=config)
    assert res1["status"] == "plan_generated"
    assert res1["shopping_intent"]["family_size"] == 2

    # Update budget to ₹2000
    state2 = {
        "conversation_id": session_id,
        "user_id": "test-user-3",
        "current_message": "Actually increase budget to ₹2000",
        "conversation_history": [],
        "shopping_intent": res1["shopping_intent"],
        "clarification_question": None,
        "grocery_items": res1["grocery_items"],
        "matched_products": [],
        "estimated_total": 0.0,
        "budget_status": "not_calculated",
        "budget_difference": 0.0,
        "suggestions": [],
        "final_response": "",
        "status": "start",
    }

    res2 = await shopping_graph.ainvoke(state2, config=config)
    assert res2["shopping_intent"]["family_size"] == 2  # Preserved!
    assert float(res2["shopping_intent"]["budget"]) == 2000.0
