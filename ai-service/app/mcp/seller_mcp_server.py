"""
ShopPilot Seller Management MCP Server
Exposes authenticated seller-management tools backed by Express internal APIs.
Supports running as a standalone MCP server (stdio) and direct in-process invocation by LangGraph.
"""
import logging
from typing import Any, Dict, Optional
import httpx
from mcp.server.fastmcp import FastMCP

from app.config import settings

logger = logging.getLogger("shoppilot-seller-mcp")

mcp = FastMCP("shoppilot-seller-management")


def _headers() -> Dict[str, str]:
    return {
        "Content-Type": "application/json",
        "x-internal-api-key": settings.INTERNAL_API_KEY,
    }


def _base_url() -> str:
    return f"{settings.EXPRESS_API_BASE_URL.rstrip('/')}/api/internal/seller"


async def _get(path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(
            f"{_base_url()}{path}",
            headers=_headers(),
            params={k: v for k, v in (params or {}).items() if v is not None},
        )
        data = resp.json()
        if resp.status_code >= 400:
            return {"success": False, "status_code": resp.status_code, **data}
        return data


async def _post(path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            f"{_base_url()}{path}",
            headers=_headers(),
            json=payload,
        )
        data = resp.json()
        if resp.status_code >= 400:
            return {"success": False, "status_code": resp.status_code, **data}
        return data


@mcp.tool()
async def get_orders(
    status: Optional[str] = None,
    timeframe: str = "all",
    needs_attention: bool = False,
    limit: int = 50,
) -> Dict[str, Any]:
    """
    Retrieve seller orders from PostgreSQL with optional status, timeframe ('all', 'today', 'week', 'month'),
    and needs_attention filter, plus overall status counts and delayed order counts.
    """
    return await _get(
        "/orders",
        {
            "status": status,
            "timeframe": timeframe,
            "needsAttention": str(needs_attention).lower(),
            "limit": limit,
        },
    )


@mcp.tool()
async def get_order_details(order_id: str) -> Dict[str, Any]:
    """
    Retrieve complete details for a specific order by full UUID or short code (e.g. '#A1B2C3' or 'A1B2C3').
    """
    cleaned = order_id.strip().lstrip("#")
    return await _get(f"/orders/{cleaned}")


@mcp.tool()
async def prepare_order_status_update(order_id: str, new_status: str) -> Dict[str, Any]:
    """
    Validate an order status update without mutating the database and return a confirmation preview.
    Valid target statuses: 'Order Received', 'Packing', 'Out for Delivery', 'Delivered', 'Cancelled'.
    Never modifies paymentStatus.
    """
    cleaned = order_id.strip().lstrip("#")
    return await _post(f"/orders/{cleaned}/prepare-status", {"status": new_status})


@mcp.tool()
async def get_inventory_status(
    filter_type: str = "all",
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
) -> Dict[str, Any]:
    """
    Retrieve real-time product inventory from PostgreSQL.
    filter_type: 'all', 'out_of_stock', 'low_stock', or 'healthy'.
    """
    return await _get(
        "/inventory",
        {
            "filter": filter_type,
            "category": category,
            "search": search,
            "limit": limit,
        },
    )


@mcp.tool()
async def prepare_stock_update(
    product_name_or_id: str,
    mode: str,
    quantity: int,
) -> Dict[str, Any]:
    """
    Prepare a product stock update without mutating the database.
    mode: 'set' (set exact stock), 'add' (increase by quantity), or 'reduce' (decrease by quantity).
    Resolves product ambiguity and returns current vs proposed stock for seller confirmation.
    """
    is_uuid = len(product_name_or_id.strip()) == 36 and "-" in product_name_or_id
    payload = {
        "mode": mode,
        "quantity": quantity,
        "productId" if is_uuid else "productName": product_name_or_id.strip(),
    }
    return await _post("/inventory/products/prepare-stock", payload)


@mcp.tool()
async def get_sales_analytics(days: int = 30) -> Dict[str, Any]:
    """
    Retrieve real PostgreSQL sales & business analytics: today's sales, weekly/monthly revenue,
    completed orders, AOV, top 5 selling products, least selling products, category revenue,
    and order status distribution.
    """
    return await _get("/analytics/sales", {"days": days})


@mcp.tool()
async def get_product_performance_and_restock(days: int = 30) -> Dict[str, Any]:
    """
    Analyze fast-selling, slow-moving, increasing/declining demand products and compute
    deterministic restocking recommendations (Reorder Point and Suggested Reorder Quantity).
    """
    return await _get("/analytics/performance", {"days": days})


if __name__ == "__main__":
    mcp.run()

