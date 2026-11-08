import logging
from typing import Any, Dict, List, Optional
import httpx

from app.config import settings
from app.integrations.provider_interface import ProductProvider

logger = logging.getLogger(__name__)


class Channel3Client(ProductProvider):
    """
    Channel3 external catalog integration provider.
    Channel3 provides external market enrichment, but does NOT override
    authoritative FreshCart prices or PostgreSQL inventory.
    Automatically falls back to Express/PostgreSQL if unavailable.
    """

    def __init__(self, api_key: Optional[str] = None, endpoint: Optional[str] = None):
        self.api_key = api_key
        self.endpoint = endpoint
        self.is_enabled = bool(api_key and endpoint)

    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Queries Channel3 if configured; gracefully returns empty on failure
        allowing primary PostgreSQL discovery to fulfill requirements.
        """
        if not self.is_enabled:
            return []

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(
                    f"{self.endpoint}/products/search",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    params={"query": query, "category": category, "limit": limit},
                )
                if res.status_code == 200:
                    return res.json().get("data", [])
        except Exception as e:
            logger.info(f"Channel3 search bypassed (using primary PostgreSQL): {e}")

        return []

    async def get_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_enabled:
            return None
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(
                    f"{self.endpoint}/products/{product_id}",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                if res.status_code == 200:
                    return res.json().get("data")
        except Exception as e:
            logger.info(f"Channel3 product fetch bypassed: {e}")
        return None


channel3_client = Channel3Client()

