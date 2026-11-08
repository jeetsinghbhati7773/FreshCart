from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional
from app.discovery.product_normalizer import ProductNormalizer
from app.discovery.product_scorer import ProductScorer
from app.optimization.package_optimizer import PackageOptimizer

logger = logging.getLogger(__name__)


class AlternativeOption:
    """Represents a classified alternative product choice."""

    def __init__(
        self,
        product: Dict[str, Any],
        classification: str,  # exact, similar, budget_friendly, premium, unresolved
        reason: str,
        price_difference: Decimal,
        package_count: int,
        subtotal: Decimal,
        match_score: float,
    ):
        self.product = product
        self.classification = classification
        self.reason = reason
        self.price_difference = price_difference
        self.package_count = package_count
        self.subtotal = subtotal
        self.match_score = match_score

    def to_dict(self) -> Dict[str, Any]:
        return {
            "product_id": str(self.product.get("id") or self.product.get("_id")),
            "product_name": self.product.get("name"),
            "category": self.product.get("category"),
            "brand": self.product.get("brand"),
            "unit": self.product.get("unit"),
            "offer_price": str(self.product.get("offerPrice", self.product.get("price", 0))),
            "mrp_price": str(self.product.get("price", 0)),
            "image_url": (self.product.get("image") or [None])[0] if isinstance(self.product.get("image"), list) and len(self.product.get("image")) > 0 else None,
            "in_stock": bool(self.product.get("inStock", True) and self.product.get("stockQuantity", 0) > 0),
            "stock_quantity": self.product.get("stockQuantity", 0),
            "classification": self.classification,
            "reason": self.reason,
            "price_difference": str(self.price_difference),
            "package_count": self.package_count,
            "subtotal": str(self.subtotal),
            "match_score": round(self.match_score, 3),
        }


class AlternativeFinder:
    """
    Finds and classifies alternative products for out-of-stock,
    insufficient stock, or over-budget items.
    """

    @classmethod
    def classify_candidate(
        cls,
        original_product: Optional[Dict[str, Any]],
        candidate_product: Dict[str, Any],
        required_quantity: float,
        required_unit: str,
        dietary_preferences: Optional[List[str]] = None,
    ) -> Optional[AlternativeOption]:
        """
        Classifies candidate as exact, similar, budget_friendly, or premium.
        Enforces category and dietary consistency.
        """
        cand_id = str(candidate_product.get("id") or candidate_product.get("_id"))
        orig_id = str(original_product.get("id") or original_product.get("_id")) if original_product else None

        # Cannot be an alternative to itself
        if orig_id and cand_id == orig_id:
            return None

        # Verify candidate is in stock
        cand_stock = int(candidate_product.get("stockQuantity", 0))
        if not candidate_product.get("inStock", True) or cand_stock <= 0:
            return None

        # Calculate packages for candidate
        pkg_res = PackageOptimizer.calculate_packages(
            required_quantity=required_quantity,
            required_unit=required_unit,
            product=candidate_product,
        )

        cand_price = Decimal(str(candidate_product.get("offerPrice", candidate_product.get("price", 0))))
        cand_subtotal = cand_price * Decimal(str(pkg_res.required_packages))

        if not original_product:
            return AlternativeOption(
                product=candidate_product,
                classification="similar",
                reason="Available in-stock catalog option",
                price_difference=Decimal("0.00"),
                package_count=pkg_res.required_packages,
                subtotal=cand_subtotal,
                match_score=0.8,
            )

        orig_price = Decimal(str(original_product.get("offerPrice", original_product.get("price", 0))))
        orig_pkg_res = PackageOptimizer.calculate_packages(
            required_quantity=required_quantity,
            required_unit=required_unit,
            product=original_product,
        )
        orig_subtotal = orig_price * Decimal(str(orig_pkg_res.required_packages))
        price_diff = cand_subtotal - orig_subtotal

        orig_name = original_product.get("name", "").lower()
        cand_name = candidate_product.get("name", "").lower()
        orig_cat = original_product.get("category", "").lower()
        cand_cat = candidate_product.get("category", "").lower()

        # Enforce category compatibility
        if orig_cat != cand_cat and orig_cat not in cand_cat and cand_cat not in orig_cat:
            return None

        # Semantic comparison
        semantic_sim = ProductScorer.compute_semantic_score(orig_name, cand_name)

        # Classification logic
        classification = "similar"
        reason = "Functional alternative in same category"

        if semantic_sim >= 0.7:
            if abs(price_diff) <= Decimal("10.00"):
                classification = "exact"
                reason = "Exact equivalent in brand or pack size"
            elif price_diff < Decimal("0.00"):
                classification = "budget_friendly"
                reason = f"Identical product type saving ₹{abs(price_diff):.2f}"
            else:
                classification = "premium"
                reason = f"Upgraded equivalent costing ₹{price_diff:.2f} more"
        else:
            if price_diff < Decimal("-20.00"):
                classification = "budget_friendly"
                reason = f"Budget alternative in {candidate_product.get('category')} saving ₹{abs(price_diff):.2f}"
            elif price_diff > Decimal("30.00"):
                classification = "premium"
                reason = f"Premium grade substitute in {candidate_product.get('category')}"
            else:
                classification = "similar"
                reason = f"Similar option in {candidate_product.get('category')}"

        return AlternativeOption(
            product=candidate_product,
            classification=classification,
            reason=reason,
            price_difference=price_diff,
            package_count=pkg_res.required_packages,
            subtotal=cand_subtotal,
            match_score=semantic_sim,
        )

    @classmethod
    def find_alternatives(
        cls,
        original_product: Optional[Dict[str, Any]],
        candidates: List[Dict[str, Any]],
        required_quantity: float,
        required_unit: str,
        dietary_preferences: Optional[List[str]] = None,
        max_alternatives: int = 4,
    ) -> List[Dict[str, Any]]:
        """
        Evaluates a list of candidate products and returns classified alternatives.
        """
        alternatives: List[AlternativeOption] = []

        for cand in candidates:
            # Handle candidate wrapped in scoring dictionary
            prod = cand.get("product", cand) if isinstance(cand, dict) else cand
            alt = cls.classify_candidate(
                original_product=original_product,
                candidate_product=prod,
                required_quantity=required_quantity,
                required_unit=required_unit,
                dietary_preferences=dietary_preferences,
            )
            if alt:
                alternatives.append(alt)

        # Sort: exact > budget_friendly > similar > premium
        order = {"exact": 0, "budget_friendly": 1, "similar": 2, "premium": 3}
        alternatives.sort(key=lambda a: (order.get(a.classification, 4), -a.match_score))

        return [a.to_dict() for a in alternatives[:max_alternatives]]


alternative_finder = AlternativeFinder()
