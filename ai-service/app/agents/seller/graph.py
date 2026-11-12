"""
LangGraph Seller Management Agent
Uses LangGraph StateGraph + MCP-backed seller tools + configurable LLM (Gemini / OpenAI / Groq).
"""
import json
import logging
from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.tools import tool
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages

from app.mcp import seller_mcp_server as mcp_tools
from app.services.llm_service import llm_service

logger = logging.getLogger("shoppilot-seller-agent")

SELLER_SYSTEM_PROMPT = """You are ShopPilot Seller Assistant, an intelligent AI operations manager for a FreshCart / ShopPilot grocery store seller.

CRITICAL RULES:
1. ALWAYS use the available tools to fetch real PostgreSQL data before answering questions about orders, inventory, product performance, restocking, or sales/revenue. NEVER invent or guess order IDs, product names, stock counts, or revenue numbers.
2. NEVER execute or claim to have executed a stock change or order status change directly. For any mutation request:
   - Order status updates -> call `prepare_order_status_update(order_id, new_status)`.
   - Stock updates -> call `prepare_stock_update(product_name_or_id, mode, quantity)` where mode is 'set', 'add', or 'reduce'.
     * "Set stock to 50" -> mode='set', quantity=50.
     * "Add 20 units" / "Increase by 20" -> mode='add', quantity=20.
     * "Reduce by 10" -> mode='reduce', quantity=10.
   - If the prepare tool returns `success: true`, clearly present the current vs. proposed values and ask the seller to click **Confirm** on the confirmation card.
   - If the prepare tool returns `ambiguous: true`, list the matching candidates and ask the seller to specify which exact item or order they mean.
3. NEVER modify payment status (`paymentStatus`). If asked to mark an order as paid, explain that payment status is controlled strictly by verified payment-provider webhooks/captures.
4. For restocking recommendations, present the deterministic Reorder Point and Suggested Reorder Quantity from `get_product_performance_and_restock`, and mention the assumptions (`isEstimate` / `assumptionNote`) when sales history is sparse.
5. Keep responses concise, structured with bullet points or tables, and use INR (₹) for currency."""


class SellerAgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    tools_used: List[str]
    pending_action: Optional[Dict[str, Any]]
    structured_data: Optional[Dict[str, Any]]
    message_type: str


# Wrap MCP tools as LangChain @tool functions so LangGraph & any LLM provider can bind them cleanly
@tool
async def tool_get_orders(
    status: Optional[str] = None,
    timeframe: str = "all",
    needs_attention: bool = False,
    limit: int = 50,
) -> str:
    """Retrieve seller orders with optional status ('Order Received', 'Packing', 'Out for Delivery', 'Delivered', 'Cancelled'), timeframe ('all', 'today', 'week', 'month'), or needs_attention=True."""
    res = await mcp_tools.get_orders(
        status=status, timeframe=timeframe, needs_attention=needs_attention, limit=limit
    )
    return json.dumps(res, default=str)


@tool
async def tool_get_order_details(order_id: str) -> str:
    """Retrieve full details for a specific order by UUID or short code (e.g. '#A1B2C3')."""
    res = await mcp_tools.get_order_details(order_id=order_id)
    return json.dumps(res, default=str)


@tool
async def tool_prepare_order_status_update(order_id: str, new_status: str) -> str:
    """Validate and prepare an order status update for seller confirmation. Does NOT mutate the database."""
    res = await mcp_tools.prepare_order_status_update(
        order_id=order_id, new_status=new_status
    )
    return json.dumps(res, default=str)


@tool
async def tool_get_inventory_status(
    filter_type: str = "all",
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
) -> str:
    """Retrieve product inventory. filter_type can be 'all', 'out_of_stock', 'low_stock', or 'healthy'."""
    res = await mcp_tools.get_inventory_status(
        filter_type=filter_type, category=category, search=search, limit=limit
    )
    return json.dumps(res, default=str)


@tool
async def tool_prepare_stock_update(
    product_name_or_id: str, mode: str, quantity: int
) -> str:
    """Prepare a stock update for seller confirmation. mode must be 'set', 'add', or 'reduce'. Does NOT mutate the database."""
    res = await mcp_tools.prepare_stock_update(
        product_name_or_id=product_name_or_id, mode=mode, quantity=quantity
    )
    return json.dumps(res, default=str)


@tool
async def tool_get_sales_analytics(days: int = 30) -> str:
    """Retrieve sales & revenue analytics: today's sales, weekly/monthly revenue, completed orders, AOV, top 5 & least selling products, category revenue, and order status distribution."""
    res = await mcp_tools.get_sales_analytics(days=days)
    return json.dumps(res, default=str)


@tool
async def tool_get_product_performance_and_restock(days: int = 30) -> str:
    """Analyze fast-selling, slow-moving, increasing/declining demand products and compute deterministic restocking recommendations."""
    res = await mcp_tools.get_product_performance_and_restock(days=days)
    return json.dumps(res, default=str)


TOOLS = [
    tool_get_orders,
    tool_get_order_details,
    tool_prepare_order_status_update,
    tool_get_inventory_status,
    tool_prepare_stock_update,
    tool_get_sales_analytics,
    tool_get_product_performance_and_restock,
]
TOOL_BY_NAME = {t.name: t for t in TOOLS}


async def _agent_node(state: SellerAgentState) -> Dict[str, Any]:
    client = llm_service._client
    if client is None:
        # Rule-based fallback if no LLM key is configured
        last_human = next(
            (m.content for m in reversed(state["messages"]) if isinstance(m, HumanMessage)),
            "",
        ).lower()
        if "out of stock" in last_human:
            data = await mcp_tools.get_inventory_status(filter_type="out_of_stock")
            items = data.get("products", [])
            reply = (
                f"Currently, {len(items)} products are out of stock: "
                + ", ".join(f"{p['name']} (0 units)" for p in items[:15])
                if items
                else "All active products currently have stock available."
            )
            return {"messages": [AIMessage(content=reply)], "tools_used": ["get_inventory_status"]}
        if "low stock" in last_human or "restock" in last_human:
            data = await mcp_tools.get_product_performance_and_restock()
            recs = data.get("restockRecommendations", [])
            reply = (
                "Restock recommendations: "
                + "; ".join(
                    f"{r['name']} (avail {r['availableStock']}, reorder +{r['suggestedReorderQty']})"
                    for r in recs[:10]
                )
                if recs
                else "No products currently need restocking."
            )
            return {
                "messages": [AIMessage(content=reply)],
                "tools_used": ["get_product_performance_and_restock"],
            }
        if "revenue" in last_human or "sales" in last_human:
            data = await mcp_tools.get_sales_analytics()
            reply = (
                f"Today's sales: ₹{data.get('todaySales', 0)} | "
                f"Weekly: ₹{data.get('weeklyRevenue', 0)} | "
                f"Monthly: ₹{data.get('monthlyRevenue', 0)} | "
                f"AOV: ₹{data.get('averageOrderValue', 0)}"
            )
            return {"messages": [AIMessage(content=reply)], "tools_used": ["get_sales_analytics"]}
        data = await mcp_tools.get_orders()
        summary = data.get("summary", {})
        reply = (
            f"Total orders: {summary.get('totalOrders', 0)}. "
            f"Awaiting action: {summary.get('awaitingActionCount', 0)}."
        )
        return {"messages": [AIMessage(content=reply)], "tools_used": ["get_orders"]}

    llm_with_tools = client.bind_tools(TOOLS)
    msgs = [SystemMessage(content=SELLER_SYSTEM_PROMPT)] + list(state["messages"])
    response = await llm_with_tools.ainvoke(msgs)
    return {"messages": [response]}


async def _tool_node(state: SellerAgentState) -> Dict[str, Any]:
    last_msg = state["messages"][-1]
    tool_calls = getattr(last_msg, "tool_calls", None) or []

    tool_messages: List[ToolMessage] = []
    tools_used = list(state.get("tools_used", []))
    pending_action = state.get("pending_action")
    structured_data = state.get("structured_data")
    message_type = state.get("message_type", "text")

    for tc in tool_calls:
        name = tc["name"]
        args = tc.get("args") or {}
        tool_fn = TOOL_BY_NAME.get(name)
        if not tool_fn:
            result_str = json.dumps({"success": False, "message": f"Unknown tool: {name}"})
        else:
            try:
                result_str = await tool_fn.ainvoke(args)
            except Exception as exc:
                logger.exception("Seller tool %s failed", name)
                result_str = json.dumps({"success": False, "message": str(exc)})

        tools_used.append(name.replace("tool_", ""))

        try:
            parsed = json.loads(result_str)
            if isinstance(parsed, dict):
                if (
                    name in ("tool_prepare_order_status_update", "tool_prepare_stock_update")
                    and parsed.get("success") is True
                ):
                    pending_action = parsed
                    message_type = "confirmation"
                elif name == "tool_get_orders" and parsed.get("success"):
                    structured_data = {"kind": "orders", "data": parsed}
                    message_type = "orders"
                elif name == "tool_get_inventory_status" and parsed.get("success"):
                    structured_data = {"kind": "inventory", "data": parsed}
                    message_type = "inventory"
                elif name == "tool_get_sales_analytics" and parsed.get("success"):
                    structured_data = {"kind": "analytics", "data": parsed}
                    message_type = "analytics"
        except Exception:
            pass

        tool_messages.append(
            ToolMessage(content=result_str, tool_call_id=tc["id"], name=name)
        )

    return {
        "messages": tool_messages,
        "tools_used": tools_used,
        "pending_action": pending_action,
        "structured_data": structured_data,
        "message_type": message_type,
    }


def _should_continue(state: SellerAgentState) -> str:
    last_msg = state["messages"][-1]
    if getattr(last_msg, "tool_calls", None):
        return "tools"
    return END


def _build_graph():
    workflow = StateGraph(SellerAgentState)
    workflow.add_node("agent", _agent_node)
    workflow.add_node("tools", _tool_node)
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", _should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "agent")
    return workflow.compile()


seller_graph = _build_graph()


async def run_seller_agent(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Execute one turn of the LangGraph Seller Management Agent."""
    lc_history: List[BaseMessage] = []
    for h in (history or [])[-12:]:
        role = h.get("role", "user")
        content = h.get("content", "")
        if not content:
            continue
        if role == "assistant":
            lc_history.append(AIMessage(content=content))
        elif role == "user":
            lc_history.append(HumanMessage(content=content))

    lc_history.append(HumanMessage(content=message))

    initial_state: SellerAgentState = {
        "messages": lc_history,
        "tools_used": [],
        "pending_action": None,
        "structured_data": None,
        "message_type": "text",
    }

    final_state = await seller_graph.ainvoke(
        initial_state, config={"recursion_limit": 12}
    )

    reply = ""
    for msg in reversed(final_state["messages"]):
        if isinstance(msg, AIMessage) and msg.content:
            reply = (
                msg.content
                if isinstance(msg.content, str)
                else "\n".join(
                    part.get("text", "") if isinstance(part, dict) else str(part)
                    for part in msg.content
                )
            )
            break

    return {
        "reply": reply or "I have retrieved the information for you.",
        "message_type": final_state.get("message_type", "text"),
        "tools_used": final_state.get("tools_used", []),
        "pending_action": final_state.get("pending_action"),
        "structured_data": final_state.get("structured_data"),
    }

