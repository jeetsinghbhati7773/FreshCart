from typing import Any, Dict, List, Optional, TypedDict


class AgentState(TypedDict):
    conversation_id: str
    user_id: Optional[str]
    current_message: str
    conversation_history: List[Dict[str, str]]
    user_memories: Optional[List[Dict[str, Any]]]
    conversation_summary: Optional[str]
    applied_memories: Optional[List[str]]
    shopping_intent: Optional[Dict[str, Any]]
    clarification_question: Optional[str]
    grocery_items: List[Dict[str, Any]]
    matched_products: List[Dict[str, Any]]
    estimated_total: float
    budget_status: str
    budget_difference: float
    suggestions: List[str]
    optimized_cart: Optional[Dict[str, Any]]
    final_response: str
    status: str

