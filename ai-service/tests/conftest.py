import json
import pytest
from app.services.llm_service import llm_service
from app.agents.nodes.intent_extractor import rule_based_extract


@pytest.fixture(autouse=True)
def mock_llm(monkeypatch):
    """
    Mock LLM responses during tests to ensure instantaneous, deterministic execution
    without paid API calls or network dependency (Section 15).
    """
    async def mock_generate_structured(system_prompt, user_prompt, response_model, retries=2):
        if response_model.__name__ == "ShoppingIntent":
            msg = user_prompt.split("\n")[0].replace("Current Customer Message: '", "").rstrip("'")
            existing = {}
            for line in user_prompt.split("\n"):
                if line.startswith("Existing Intent State:"):
                    try:
                        raw = line.replace("Existing Intent State:", "").strip()
                        if raw and raw != "{}":
                            existing = json.loads(raw)
                    except Exception:
                        pass
            return rule_based_extract(msg, existing)
        elif response_model.__name__ == "GroceryItemListResponse":
            from app.agents.nodes.grocery_planner import generate_rule_based_items, GroceryItemListResponse
            items = generate_rule_based_items(4, 7, ["Vegetables", "Dairy", "Grains"], True)
            return GroceryItemListResponse(items=items)
        return response_model()

    async def mock_generate_text(system_prompt, user_prompt):
        return "I have tailored a personalized grocery plan for your household."

    monkeypatch.setattr(llm_service, "generate_structured", mock_generate_structured)
    monkeypatch.setattr(llm_service, "generate_text", mock_generate_text)
