from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.agents.state import AgentState
from app.agents.nodes.intent_extractor import intent_extractor_node
from app.agents.nodes.clarification import ask_clarification_node
from app.agents.nodes.grocery_planner import grocery_planner_node
from app.agents.nodes.product_matcher import product_matcher_node
from app.agents.nodes.budget_validator import budget_validator_node
from app.agents.nodes.response_generator import response_generator_node


def check_missing_information_condition(state: AgentState) -> Literal["ask_clarification", "generate_grocery_list"]:
    """
    Evaluates whether the extracted intent requires user clarification
    or has sufficient data to proceed to grocery planning.
    """
    intent = state.get("shopping_intent") or {}
    if intent.get("requires_clarification", False):
        return "ask_clarification"
    return "generate_grocery_list"


def create_shopping_graph():
    """
    Constructs the LangGraph StateGraph workflow for ShopPilot.
    """
    builder = StateGraph(AgentState)

    # 1. Register nodes
    builder.add_node("extract_intent", intent_extractor_node)
    builder.add_node("ask_clarification", ask_clarification_node)
    builder.add_node("generate_grocery_list", grocery_planner_node)
    builder.add_node("match_products", product_matcher_node)
    builder.add_node("validate_budget", budget_validator_node)
    builder.add_node("generate_response", response_generator_node)

    # 2. Add edges & conditional branching
    builder.add_edge(START, "extract_intent")

    builder.add_conditional_edges(
        "extract_intent",
        check_missing_information_condition,
        {
            "ask_clarification": "ask_clarification",
            "generate_grocery_list": "generate_grocery_list",
        },
    )

    builder.add_edge("ask_clarification", END)
    builder.add_edge("generate_grocery_list", "match_products")
    builder.add_edge("match_products", "validate_budget")
    builder.add_edge("validate_budget", "generate_response")
    builder.add_edge("generate_response", END)

    # 3. Compile with persistent thread memory checkpointer
    memory = MemorySaver()
    return builder.compile(checkpointer=memory)


# Global compiled graph
shopping_graph = create_shopping_graph()

