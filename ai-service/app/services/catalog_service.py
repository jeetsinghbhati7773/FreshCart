import logging
import re
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple
import httpx

from app.config import settings
from app.schemas.grocery_plan import GroceryItem, MatchedProduct

logger = logging.getLogger(__name__)


class CatalogService:
    """
    Communicates with the Express backend to search FreshCart products,
    verify real prices, check stock availability, and map grocery requirements
    to packaged catalog products.
    """

    def __init__(self):
        self.base_url = settings.EXPRESS_API_BASE_URL.rstrip("/")
        self.internal_key = settings.INTERNAL_API_KEY

    def _headers(self) -> Dict[str, str]:
        return {
            "x-internal-api-key": self.internal_key,
            "Content-Type": "application/json",
        }

    async def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Calls internal Express catalog search endpoint.
        Falls back to public /api/products if internal endpoint is unavailable.
        """
        timeout = httpx.Timeout(4.0, connect=1.5)
        async with httpx.AsyncClient(timeout=timeout) as client:
            # 1. Try internal search endpoint
            try:
                params = {"query": query, "limit": limit}
                if category:
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
                logger.warning("Express backend is unreachable on %s", self.base_url)
                return []
            except Exception as e:
                logger.debug(f"Internal product search failed, falling back to public: {e}")

            # 2. Fallback to public products endpoint
            try:
                params = {"search": query, "limit": limit}
                if category and category.lower() != "all":
                    params["category"] = category
                res = await client.get(
                    f"{self.base_url}/api/products",
                    params=params,
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("products", [])
            except Exception as e:
                logger.error(f"Catalog search error for query='{query}': {e}")
                return []

        return []

    async def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Fetch exact real product by ID to confirm latest price and stock."""
        timeout = httpx.Timeout(4.0, connect=1.5)
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                res = await client.get(
                    f"{self.base_url}/api/internal/ai/products/{product_id}",
                    headers=self._headers(),
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("product")
            except httpx.ConnectError:
                return None
            except Exception:
                pass

            try:
                res = await client.get(f"{self.base_url}/api/products/{product_id}")
                if res.status_code == 200:
                    data = res.json()
                    return data.get("product")
            except Exception as e:
                logger.error(f"Failed to fetch product {product_id}: {e}")
                return None

        return None

    @staticmethod
    def _parse_package_size(unit_str: Optional[str], product_name: str) -> Tuple[float, str]:
        """
        Extract numerical size and unit from unit field or product name.
        e.g. '500g' -> (0.5, 'kg') or (500.0, 'g')
        e.g. '1L' -> (1.0, 'litres')
        """
        combined = f"{unit_str or ''} {product_name}".lower()

        # Check for kg
        kg_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilogram)', combined)
        if kg_m:
            return float(kg_m.group(1)), "kg"

        # Check for g
        g_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram)', combined)
        if g_m:
            return float(g_m.group(1)), "g"

        # Check for litres
        l_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:l|ltr|litre|litres|liter)', combined)
        if l_m:
            return float(l_m.group(1)), "litres"

        # Check for ml
        ml_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:ml|milli)', combined)
        if ml_m:
            return float(ml_m.group(1)), "ml"

        return 1.0, "pcs"

    def calculate_package_count(
        self,
        item: GroceryItem,
        product: Dict[str, Any],
    ) -> int:
        """
        Calculates how many catalog packages are needed to fulfill the estimated grocery quantity.
        e.g. Requirement: 7 litres Milk. Catalog item: 500ml pack -> returns 14 packs.
        """
        pkg_qty, pkg_unit = self._parse_package_size(product.get("unit"), product.get("name", ""))
        req_qty = float(item.estimated_quantity)
        req_unit = item.unit.lower()

        # Standardize matching units
        if req_unit in ["litres", "l"] and pkg_unit == "ml":
            needed_ml = req_qty * 1000.0
            return max(1, int(round(needed_ml / max(1.0, pkg_qty))))
        elif req_unit in ["kg", "kgs"] and pkg_unit == "g":
            needed_g = req_qty * 1000.0
            return max(1, int(round(needed_g / max(1.0, pkg_qty))))
        elif req_unit == pkg_unit and pkg_qty > 0:
            return max(1, int(round(req_qty / pkg_qty)))
        else:
            # Fallback to integer units
            return max(1, int(round(req_qty)))

    async def match_item_to_product(self, item: GroceryItem) -> Optional[MatchedProduct]:
        """
        Finds the best matching catalog product from FreshCart PostgreSQL database
        and calculates package multiplier, total cost, and stock verification.
        """
        # Clean item name: remove parenthetical synonyms e.g. "Atta (Wheat Flour)" -> "Atta"
        cleaned_name = re.sub(r'\(.*?\)', '', item.name).strip()

        # 1. Search catalog by cleaned grocery name and category
        candidates = await self.search_products(query=cleaned_name, category=item.category, limit=5)
        
        # 2. Try singular form (e.g. "Potatoes" -> "Potato", "Tomatoes" -> "Tomato", "Onions" -> "Onion")
        if not candidates and (cleaned_name.endswith("s") or cleaned_name.endswith("es")):
            singular = re.sub(r'es$', '', cleaned_name) if cleaned_name.endswith("es") else cleaned_name[:-1]
            candidates = await self.search_products(query=singular, category=item.category, limit=5)

        # 3. If not found, try the first keyword (e.g. "Toor" from "Toor Dal")
        if not candidates:
            parts = cleaned_name.split()
            if len(parts) > 1:
                candidates = await self.search_products(query=parts[0], category=item.category, limit=5)

        # 4. If still not found, search across all categories
        if not candidates:
            candidates = await self.search_products(query=cleaned_name, limit=5)

        if not candidates:
            logger.info(f"No catalog product found for grocery item: {item.name}")
            return None

        # Filter candidate products that are active and in stock
        in_stock_candidates = [c for c in candidates if c.get("inStock", True) and c.get("stockQuantity", 0) > 0]
        selected = in_stock_candidates[0] if in_stock_candidates else candidates[0]

        # Extract verified database fields
        prod_id = selected.get("id") or selected.get("_id")
        prod_name = selected.get("name")
        offer_price = Decimal(str(selected.get("offerPrice", selected.get("price", 0))))
        mrp_price = Decimal(str(selected.get("price", offer_price)))
        stock_qty = int(selected.get("stockQuantity", 50))
        in_stock = bool(selected.get("inStock", True) and stock_qty > 0)
        images = selected.get("image", [])
        image_url = images[0] if images and len(images) > 0 else None

        # Calculate needed package count
        required_packs = self.calculate_package_count(item, selected)

        # Check stock sufficiency
        stock_sufficient = stock_qty >= required_packs
        actual_packs = min(required_packs, stock_qty) if in_stock else 0
        shortage_note = None
        if not stock_sufficient and in_stock:
            shortage_note = f"Requested {required_packs} packs, but only {stock_qty} available in stock."
        elif not in_stock:
            shortage_note = "Item is currently out of stock."

        item_subtotal = offer_price * Decimal(str(actual_packs if actual_packs > 0 else required_packs))

        return MatchedProduct(
            grocery_item_name=item.name,
            product_id=str(prod_id),
            product_name=str(prod_name),
            category=str(selected.get("category", item.category)),
            brand=selected.get("brand"),
            package_size=selected.get("unit"),
            offer_price=offer_price,
            mrp_price=mrp_price,
            image_url=image_url,
            package_count=actual_packs if actual_packs > 0 else required_packs,
            item_subtotal=item_subtotal,
            in_stock=in_stock,
            available_stock=stock_qty,
            stock_sufficient=stock_sufficient,
            shortage_note=shortage_note,
        )


catalog_service = CatalogService()

