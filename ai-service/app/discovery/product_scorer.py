import math
import re
from typing import Any, Dict, List, Optional
from app.discovery.product_normalizer import ProductNormalizer


class ProductScorer:
    """
    Ranks product candidates using multi-factor criteria:
    0.35 * semantic + 0.20 * category + 0.15 * package_suitability
    + 0.10 * brand + 0.10 * price_competitiveness + 0.10 * stock_availability
    """

    WEIGHTS = {
        "semantic": 0.35,
        "category": 0.20,
        "package_suitability": 0.15,
        "brand": 0.10,
        "price": 0.10,
        "stock": 0.10,
    }

    @classmethod
    def compute_semantic_score(cls, requirement_name: str, product_name: str) -> float:
        """Calculates token overlap and substring match score between 0.0 and 1.0."""
        req_clean = ProductNormalizer.clean_query_text(requirement_name).lower()
        prod_clean = ProductNormalizer.clean_query_text(product_name).lower()

        if req_clean == prod_clean:
            return 1.0

        req_tokens = set(req_clean.split())
        prod_tokens = set(prod_clean.split())

        # Singularize all tokens
        req_singular = {ProductNormalizer.singularize(t) for t in req_tokens}
        prod_singular = {ProductNormalizer.singularize(t) for t in prod_tokens}

        overlap = req_singular.intersection(prod_singular)
        if not req_singular:
            return 0.5

        token_score = len(overlap) / len(req_singular)

        # Bonus if the core requirement is an exact substring of product name
        for term in req_singular:
            if term in prod_clean:
                token_score = max(token_score, 0.75)

        return min(1.0, max(0.0, token_score))

    @classmethod
    def compute_category_score(cls, req_category: Optional[str], prod_category: Optional[str]) -> float:
        """1.0 if category matches exactly, 0.0 if different."""
        if not req_category or not prod_category:
            return 0.5
        req_c = req_category.strip().lower()
        prod_c = prod_category.strip().lower()
        if req_c == prod_c:
            return 1.0
        # Check partial category matching (e.g. "grain" in "grains")
        if req_c in prod_c or prod_c in req_c:
            return 0.9
        return 0.1

    @classmethod
    def compute_package_suitability_score(
        cls,
        req_quantity: float,
        req_unit: str,
        prod_size_val: float,
        prod_unit: str,
    ) -> float:
        """
        Evaluates how close the package size is to the requirement.
        Penalizes large excess packaging (e.g. needing 250g but buying 5kg).
        """
        std_req_qty, std_req_unit = ProductNormalizer.standardize_quantity(req_quantity, req_unit)
        std_pkg_size, std_pkg_unit = ProductNormalizer.standardize_quantity(prod_size_val, prod_unit)

        if std_req_unit != std_pkg_unit:
            return 0.5

        if std_pkg_size <= 0:
            return 0.5

        # Packages needed = ceil(req / pkg_size)
        packages_needed = math.ceil(std_req_qty / std_pkg_size)
        supplied = packages_needed * std_pkg_size
        excess = supplied - std_req_qty
        excess_ratio = excess / max(0.001, std_req_qty)

        if excess_ratio == 0:
            return 1.0
        elif excess_ratio <= 0.2:
            return 0.9
        elif excess_ratio <= 0.5:
            return 0.75
        elif excess_ratio <= 1.0:
            return 0.6
        else:
            return max(0.2, 1.0 - (excess_ratio * 0.2))

    @classmethod
    def compute_brand_score(cls, prod_brand: Optional[str], preferred_brands: List[str]) -> float:
        """1.0 if matches preferred brand, 0.6 if brand exists, 0.4 if generic."""
        if not prod_brand:
            return 0.5
        if preferred_brands:
            brand_lower = prod_brand.strip().lower()
            for pref in preferred_brands:
                if pref.strip().lower() in brand_lower:
                    return 1.0
        return 0.7

    @classmethod
    def compute_price_score(cls, offer_price: float, mrp_price: float) -> float:
        """Rewards products offering a discount over MRP."""
        if mrp_price <= 0:
            return 0.5
        discount_ratio = (mrp_price - offer_price) / mrp_price
        # Discount of 10-30% yields score between 0.7 and 1.0
        return min(1.0, max(0.4, 0.5 + discount_ratio))

    @classmethod
    def compute_stock_score(cls, stock_qty: int, packages_needed: int, in_stock: bool) -> float:
        """1.0 if stock covers required packages, 0.5 if partial, 0.0 if out of stock."""
        if not in_stock or stock_qty <= 0:
            return 0.0
        if stock_qty >= packages_needed:
            return 1.0
        return max(0.2, float(stock_qty) / max(1.0, float(packages_needed)))

    @classmethod
    def score_candidate(
        cls,
        candidate: Dict[str, Any],
        requirement_name: str,
        req_quantity: float,
        req_unit: str,
        req_category: Optional[str] = None,
        preferred_brands: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Computes composite score and component scores for a single product candidate.
        """
        prod_name = candidate.get("name", "")
        prod_category = candidate.get("category", "")
        prod_brand = candidate.get("brand")
        offer_price = float(candidate.get("offerPrice", candidate.get("price", 0)))
        mrp_price = float(candidate.get("price", offer_price))
        stock_qty = int(candidate.get("stockQuantity", 50))
        in_stock = bool(candidate.get("inStock", True) and stock_qty > 0)

        # Parse package size
        pkg_size_val, pkg_unit = ProductNormalizer.parse_package_size(
            candidate.get("unit"), prod_name
        )

        std_req_qty, std_req_unit = ProductNormalizer.standardize_quantity(req_quantity, req_unit)
        std_pkg_size, std_pkg_unit = ProductNormalizer.standardize_quantity(pkg_size_val, pkg_unit)
        packages_needed = math.ceil(std_req_qty / max(0.001, std_pkg_size))

        s_semantic = cls.compute_semantic_score(requirement_name, prod_name)
        s_category = cls.compute_category_score(req_category, prod_category)
        s_package = cls.compute_package_suitability_score(req_quantity, req_unit, pkg_size_val, pkg_unit)
        s_brand = cls.compute_brand_score(prod_brand, preferred_brands or [])
        s_price = cls.compute_price_score(offer_price, mrp_price)
        s_stock = cls.compute_stock_score(stock_qty, packages_needed, in_stock)

        composite_score = (
            cls.WEIGHTS["semantic"] * s_semantic
            + cls.WEIGHTS["category"] * s_category
            + cls.WEIGHTS["package_suitability"] * s_package
            + cls.WEIGHTS["brand"] * s_brand
            + cls.WEIGHTS["price"] * s_price
            + cls.WEIGHTS["stock"] * s_stock
        )

        return {
            "product": candidate,
            "composite_score": round(composite_score, 4),
            "packages_needed": packages_needed,
            "package_size": pkg_size_val,
            "package_unit": pkg_unit,
            "scores": {
                "semantic": round(s_semantic, 3),
                "category": round(s_category, 3),
                "package_suitability": round(s_package, 3),
                "brand": round(s_brand, 3),
                "price": round(s_price, 3),
                "stock": round(s_stock, 3),
            },
        }
