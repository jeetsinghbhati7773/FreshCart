import logging
from typing import Any, Dict

from app.agents.state import AgentState
from app.prompts.grocery_planner_prompt import RESPONSE_SYNTHESIS_SYSTEM_PROMPT
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


def formulate_fallback_response(state: AgentState) -> str:
    """Generate friendly conversational response without LLM dependency."""
    intent = state.get("shopping_intent") or {}
    fam = intent.get("family_size", 4)
    dur = intent.get("duration_days", 7)
    budget = intent.get("budget")
    total = state.get("estimated_total", 0.0)
    status = state.get("budget_status", "not_calculated")
    diff = state.get("budget_difference", 0.0)
    suggestions = state.get("suggestions", [])

    lines = [
        f"I've tailored a personalized grocery plan for your household of {fam} for {dur} days.",
        f"The total estimated cost comes to ₹{total:.2f} based on FreshCart's current catalog prices."
    ]

    if budget:
        if status == "within_budget":
            lines.append(f"Great news! Your plan is within your ₹{budget} budget (₹{diff:.2f} remaining).")
        elif status == "exceeded":
            lines.append(f"Notice: The plan exceeds your target budget of ₹{budget} by ₹{abs(diff):.2f}.")

    if suggestions:
        lines.append("\n" + "\n".join([f"• {s}" for s in suggestions]))

    return "\n\n".join(lines)


async def response_generator_node(state: AgentState) -> Dict[str, Any]:
    """
    LangGraph node: Produces conversational final summary for customer.
    """
    intent = state.get("shopping_intent") or {}
    total = state.get("estimated_total", 0.0)
    status = state.get("budget_status", "not_calculated")
    diff = state.get("budget_difference", 0.0)
    matched = state.get("matched_products") or []

    summary_items = ", ".join([m.get("product_name", "") for m in matched[:4]])

    try:
        prompt = RESPONSE_SYNTHESIS_SYSTEM_PROMPT.format(
            family_size=intent.get("family_size", 4),
            duration_days=intent.get("duration_days", 7),
            budget=intent.get("budget", "N/A"),
            estimated_total=f"{total:.2f}",
            budget_status=status,
            budget_difference_note=f"₹{diff:.2f} difference",
            matched_summary=summary_items or "Household staples",
        )
        msg = await llm_service.generate_text(
            system_prompt="You are ShopPilot, an AI grocery assistant for FreshCart.",
            user_prompt=prompt,
        )
    except Exception as e:
        logger.info(f"Response synthesis LLM fallback: {e}")
        msg = formulate_fallback_response(state)

    return {
        "final_response": msg,
        "status": "plan_generated",
    }

