import json
import logging
import re
from decimal import Decimal
from typing import Any, Dict

from app.agents.state import AgentState
from app.prompts.intent_prompt import INTENT_SYSTEM_PROMPT
from app.schemas.intent import ShoppingIntent
from app.services.llm_service import llm_service
from app.utils.validators import parse_indian_budget, normalize_category

logger = logging.getLogger(__name__)


def rule_based_extract(message: str, existing_intent: Dict[str, Any] = None) -> ShoppingIntent:
    """
    High-reliability deterministic intent parser used as a safety fallback
    or when LLM is unavailable in offline test environments.
    """
    text = message.lower()
    data = dict(existing_intent or {})

    word_to_num = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "fourteen": 14, "fifteen": 15, "thirty": 30, "couple": 2,
    }

    # 1. Family Size extraction
    # Priority: "4 people", "family of 4", "for a family of four"
    fam_people = re.search(
        r'(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:people|persons|members|family\s*members|pax)',
        text
    )
    fam_of = re.search(
        r'(?:family\s+of\s+|for\s+(?:a\s+)?family\s+of\s+)(\d+|one|two|three|four|five|six|seven|eight|nine|ten)',
        text
    )
    if fam_people:
        val = fam_people.group(1)
        data["family_size"] = int(val) if val.isdigit() else word_to_num.get(val, 4)
    elif fam_of:
        val = fam_of.group(1)
        data["family_size"] = int(val) if val.isdigit() else word_to_num.get(val, 4)
    elif "couple" in text or "for two" in text:
        data["family_size"] = 2
    elif "alone" in text or "just for me" in text or "single" in text:
        data["family_size"] = 1
    elif not data.get("family_size"):
        for_gen = re.search(
            r'for\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)(?!\s*(?:day|days|week|month|year))',
            text
        )
        if for_gen:
            val = for_gen.group(1)
            data["family_size"] = int(val) if val.isdigit() else word_to_num.get(val, 4)

    # 2. Duration extraction (e.g. 7 days, seven days, a week, a month)
    dur_match = re.search(
        r'(\d+|one|two|three|four|five|six|seven|eight|nine|ten|fourteen|fifteen|thirty)\s*(?:day|days)',
        text
    )
    if dur_match:
        val = dur_match.group(1)
        data["duration_days"] = int(val) if val.isdigit() else word_to_num.get(val, 7)
    elif "week" in text or "weekly" in text or "7 days" in text:
        data["duration_days"] = 7
    elif "month" in text or "monthly" in text or "30 days" in text:
        data["duration_days"] = 30
    elif "weekend" in text:
        data["duration_days"] = 2

    # 3. Budget extraction (₹3000, 3k, 1500, etc.)
    budget = parse_indian_budget(text)
    if budget:
        data["budget"] = budget
    elif "budget" not in data or data["budget"] is None:
        data["budget"] = None

    data["currency"] = "INR"

    # 4. Dietary preferences
    dietary = list(data.get("dietary_preferences") or [])
    if "vegetarian" in text or "veg" in text:
        if "vegetarian" not in dietary:
            dietary.append("vegetarian")
    if "vegan" in text and "vegan" not in dietary:
        dietary.append("vegan")
    if "jain" in text and "jain" not in dietary:
        dietary.append("jain")
    data["dietary_preferences"] = dietary

    # 5. Categories
    cats = list(data.get("categories") or [])
    candidate_terms = [
        "vegetables", "dairy", "grains", "fruits",
        "bakery", "drinks", "snacks", "instant",
    ]
    for term in candidate_terms:
        if term in text:
            norm = normalize_category(term)
            if norm and norm not in cats:
                cats.append(norm)
    if not cats:
        cats = ["Vegetables", "Dairy", "Grains"]
    data["categories"] = cats

    # 6. Check missing fields
    missing = []
    if not data.get("family_size"):
        missing.append("family_size")
    if not data.get("duration_days"):
        missing.append("duration_days")
    if not data.get("budget"):
        missing.append("budget")

    data["missing_fields"] = missing
    data["requires_clarification"] = len(missing) > 0
    data["confidence"] = 0.9 if not data["requires_clarification"] else 0.75
    data["shopping_goal"] = data.get("shopping_goal") or "grocery shopping plan"

    return ShoppingIntent(**data)


async def intent_extractor_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph node: Extracts structured shopping intent from customer message.
    """
    message = state["current_message"]
    existing = state.get("shopping_intent") or {}

    try:
        user_prompt = (
            f"Current Customer Message: '{message}'\n"
            f"Existing Intent State: {json.dumps(existing, default=str)}\n"
            f"Conversation History: {json.dumps(state.get('conversation_history', []))}"
        )
        # Attempt LLM extraction
        intent_obj = await llm_service.generate_structured(
            system_prompt=INTENT_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_model=ShoppingIntent,
        )
    except Exception as e:
        logger.info(f"LLM intent extraction fallback to rule-based parser: {e}")
        intent_obj = rule_based_extract(message, existing)

    # Post-process & enforce currency normalization
    budget_from_text = parse_indian_budget(message)
    if budget_from_text:
        intent_obj.budget = budget_from_text

    # Re-verify missing fields
    missing = []
    if not intent_obj.family_size:
        missing.append("family_size")
    if not intent_obj.duration_days:
        missing.append("duration_days")
    if not intent_obj.budget:
        missing.append("budget")

    intent_obj.missing_fields = missing
    intent_obj.requires_clarification = len(missing) > 0

    return {
        "shopping_intent": intent_obj.model_dump(mode="json"),
    }
