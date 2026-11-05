import json
import logging
from typing import Any, Dict

from app.agents.state import AgentState
from app.prompts.intent_prompt import CLARIFICATION_SYSTEM_PROMPT
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


def formulate_fallback_clarification(missing_fields: list, intent: dict) -> str:
    """Generate friendly clarification question without LLM dependency."""
    has_fam = "family_size" not in missing_fields and intent.get("family_size")
    has_dur = "duration_days" not in missing_fields and intent.get("duration_days")
    has_bud = "budget" not in missing_fields and intent.get("budget")

    if not has_fam and not has_dur and not has_bud:
        return "I'd love to help plan your groceries! How many people are in your household, how many days should this order last, and what is your approximate budget?"

    if not has_fam:
        return "How many people should I plan groceries for?"

    if not has_dur and not has_bud:
        fam = intent.get("family_size", 4)
        return f"Got it, planning for {fam} people. How many days should the groceries last, and what is your target budget?"

    if not has_dur:
        return "How many days should this grocery plan cover (e.g. 7 days for a week)?"

    if not has_bud:
        return "What is your approximate budget in INR for this grocery order?"

    return "Could you provide a few more details so I can tailor the grocery plan to your needs?"


async def ask_clarification_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph node: Generates friendly conversational follow-up question.
    """
    intent = state.get("shopping_intent") or {}
    missing = intent.get("missing_fields") or []

    try:
        prompt = CLARIFICATION_SYSTEM_PROMPT.format(
            missing_fields=", ".join(missing),
            current_intent=json.dumps(intent, default=str),
        )
        question = await llm_service.generate_text(
            system_prompt="You are ShopPilot, a friendly Indian grocery assistant.",
            user_prompt=prompt,
        )
    except Exception as e:
        logger.info(f"Clarification LLM fallback: {e}")
        question = formulate_fallback_clarification(missing, intent)

    return {
        "clarification_question": question,
        "final_response": question,
        "status": "clarification_needed",
    }

