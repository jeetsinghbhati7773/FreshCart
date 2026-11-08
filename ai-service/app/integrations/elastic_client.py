import logging
from typing import Any, Dict, List, Optional
import httpx

from app.config import settings
from app.integrations.provider_interface import ProductProvider

logger = logging.getLogger(__name__)


class ElasticClient(ProductProvider):
    """
    Elastic auxiliary search index provider.
    Provides fast full-text fuzzy indexing for catalog IDs.
    All live prices and stock quantities are always verified with PostgreSQL.
    Automatically falls back to Express/PostgreSQL if Elasticsearch is not running.
    """

    def __init__(self, node_url: Optional[str] = None):
        self.node_url = node_url
        self.is_enabled = bool(node_url)

    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Queries Elasticsearch if running; falls back seamlessly to PostgreSQL."""
        if not self.is_enabled:
            return []

        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                body = {
                    "query": {
                        "multi_match": {
                            "query": query,
                            "fields": ["name^3", "description", "brand"],
                            "fuzziness": "AUTO",
                        }
                    },
                    "size": limit,
                }
                res = await client.post(f"{self.node_url}/freshcart_products/_search", json=body)
                if res.status_code == 200:
                    hits = res.json().get("hits", {}).get("hits", [])
                    return [h["_source"] for h in hits]
        except Exception as e:
            logger.info(f"Elasticsearch search bypassed (using primary PostgreSQL): {e}")

        return []

    async def get_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_enabled:
            return None
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.node_url}/freshcart_products/_doc/{product_id}")
                if res.status_code == 200:
                    return res.json().get("_source")
        except Exception as e:
            logger.info(f"Elasticsearch get_by_id bypassed: {e}")
        return None


elastic_client = ElasticClient()
