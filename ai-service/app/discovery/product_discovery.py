import logging
import re
from typing import Any, Dict, List, Optional
import httpx

from app.config import settings
from app.discovery.product_normalizer import ProductNormalizer
from app.discovery.product_scorer import ProductScorer

logger = logging.getLogger(__name__)


class ProductDiscoveryEngine:
    """
    Autonomous candidate retrieval engine:
    Performs multi-query expansion, stems keywords, and scores candidates
    using the multi-criteria ranking algorithm.
    """

    def __init__(self, base_url: Optional[str] = None, internal_key: Optional[str] = None):
        self.base_url = (base_url or settings.EXPRESS_API_BASE_URL).rstrip("/")
        self.internal_key = internal_key or settings.INTERNAL_API_KEY

    def _headers(self) -> Dict[str, str]:
        return {
            "x-internal-api-key": self.internal_key,
            "Content-Type": "application/json",
        }

    async def _query_catalog(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Invokes internal Express catalog search endpoint."""
        timeout = httpx.Timeout(4.0, connect=1.5)
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                params = {"query": query, "limit": limit}
                if category and category.lower() != "all":
                    params["category"] = category
                res = await client.get(
                    f"{self.base_url}/api/internal/ai/products/search",
                    headers=self._headers(),
                    params=params,
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("products", [])
            except httpx.ConnectError:
                return []
            except Exception as e:
                logger.debug(f"Catalog query for '{query}' failed: {e}")
        return []

    async def discover_candidates(
        self,
        requirement_name: str,
        estimated_quantity: float,
        unit: str,
        category: Optional[str] = None,
        preferred_brands: Optional[List[str]] = None,
        max_candidates: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Discovers and ranks candidate products for a given grocery requirement.
        Returns top ranked candidates with detailed scoring metrics.
        """
        cleaned = ProductNormalizer.clean_query_text(requirement_name)
        singular = ProductNormalizer.singularize(cleaned)

        seen_ids = set()
        candidates: List[Dict[str, Any]] = []

        def add_unique(items: List[Dict[str, Any]]):
            for it in items:
                it_id = str(it.get("id") or it.get("_id"))
                if it_id not in seen_ids:
                    seen_ids.add(it_id)
                    candidates.append(it)

        # 1. Exact cleaned query in category
        res1 = await self._query_catalog(cleaned, category=category, limit=8)
        add_unique(res1)

        # 2. Singular form in category
        if singular != cleaned.lower():
            res2 = await self._query_catalog(singular, category=category, limit=8)
            add_unique(res2)

        # 3. First significant token (e.g. "Wheat" from "Wheat Flour", "Toor" from "Toor Dal")
        tokens = cleaned.split()
        if len(tokens) > 1 and len(candidates) < max_candidates:
            res3 = await self._query_catalog(tokens[0], category=category, limit=6)
            add_unique(res3)

        # 4. Fallback search across all categories
        if len(candidates) < max_candidates:
            res4 = await self._query_catalog(cleaned, category=None, limit=8)
            add_unique(res4)
            if singular != cleaned.lower():
                res5 = await self._query_catalog(singular, category=None, limit=8)
                add_unique(res5)

        # Score all discovered candidates
        scored_candidates = []
        for cand in candidates:
            score_data = ProductScorer.score_candidate(
                candidate=cand,
                requirement_name=requirement_name,
                req_quantity=estimated_quantity,
                req_unit=unit,
                req_category=category,
                preferred_brands=preferred_brands,
            )
            scored_candidates.append(score_data)

        # Sort descending by composite score
        scored_candidates.sort(key=lambda x: x["composite_score"], reverse=True)

        return scored_candidates[:max_candidates]


product_discovery_engine = ProductDiscoveryEngine()

