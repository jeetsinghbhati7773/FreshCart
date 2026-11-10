from decimal import Decimal
import logging
from fastapi import APIRouter, HTTPException, status
from app.agents.graph import shopping_graph
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.intent import ShoppingIntent
from app.schemas.grocery_plan import GroceryItem, MatchedProduct
from app.optimization.optimization_models import OptimizationRequest
from app.optimization.optimizer import cart_optimizer_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    """
    Main conversational endpoint:
    Processes natural-language grocery shopping requests through LangGraph.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty",
        )

    conversation_id = payload.conversation_id or "default-session"
    config = {"configurable": {"thread_id": conversation_id}}

    try:
        # Check current state from graph memory
        current_state = await shopping_graph.aget_state(config)
        existing_history = []
        existing_intent = None
        if current_state and current_state.values:
            existing_history = current_state.values.get("conversation_history", [])
            existing_intent = current_state.values.get("shopping_intent")

        # Append customer message to history
        updated_history = list(existing_history)
        updated_history.append({"role": "user", "content": payload.message})

        initial_state = {
            "conversation_id": conversation_id,
            "user_id": payload.user_id,
            "current_message": payload.message,
            "conversation_history": updated_history,
            "user_memories": payload.user_memories or [],
            "learned_profile": payload.learned_profile,
            "preferred_brands": payload.preferred_brands or [],
            "preferred_products": payload.preferred_products or [],
            "disliked_brands": payload.disliked_brands or [],
            "disliked_product_ids": payload.disliked_product_ids or [],
            "conversation_summary": payload.conversation_summary,
            "applied_memories": [],
            "shopping_intent": existing_intent,
            "clarification_question": None,
            "grocery_items": [],
            "matched_products": [],
            "estimated_total": 0.0,
            "budget_status": "not_calculated",
            "budget_difference": 0.0,
            "suggestions": [],
            "final_response": "",
            "status": "processing",
        }

        # Run graph workflow
        result = await shopping_graph.ainvoke(initial_state, config=config)

        # Append assistant response to history
        final_msg = result.get("final_response", "")
        updated_history.append({"role": "assistant", "content": final_msg})

        raw_intent = result.get("shopping_intent")
        intent_obj = ShoppingIntent(**raw_intent) if raw_intent else None

        raw_items = result.get("grocery_items") or []
        grocery_items = [GroceryItem(**i) for i in raw_items]

        raw_matches = result.get("matched_products") or []
        matched_products = [MatchedProduct(**m) for m in raw_matches]

        # Step 3: Run Smart Cart Optimization on the generated grocery items
        optimized_cart = None
        if grocery_items:
            try:
                opt_req = OptimizationRequest(
                    conversation_id=conversation_id,
                    grocery_items=[i.model_dump(mode="json") for i in grocery_items],
                    budget=intent_obj.budget if intent_obj else None,
                    dietary_preferences=intent_obj.dietary_preferences if intent_obj else [],
                    preferred_brands=intent_obj.preferred_brands if intent_obj else [],
                )
                optimized_cart = await cart_optimizer_service.optimize_cart(opt_req)
            except Exception as opt_err:
                logger.warning(f"Optional cart optimization error in chat: {opt_err}")

        return ChatResponse(
            conversation_id=conversation_id,
            status="clarification_needed" if result.get("status") == "clarification_needed" else "plan_generated",
            intent=intent_obj,
            clarification_question=result.get("clarification_question"),
            grocery_plan=grocery_items,
            matched_products=matched_products,
            estimated_total=Decimal(str(result.get("estimated_total", 0.0))),
            budget_status=result.get("budget_status", "not_calculated"),
            budget_difference=Decimal(str(result.get("budget_difference", 0.0))),
            optimized_cart=optimized_cart,
            assistant_message=final_msg,
            message=final_msg,
        )

    except Exception as e:
        logger.error(f"Error executing chat workflow: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in shopping assistant: {str(e)}",
        )

