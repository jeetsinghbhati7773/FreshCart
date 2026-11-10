import logging
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class BrandSignal(BaseModel):
    brand: str
    confidence: float = 0.9
    is_disliked: bool = False


class ProductSignal(BaseModel):
    product_name: str
    confidence: float = 0.9
    is_disliked: bool = False


class ExtractedPreferences(BaseModel):
    preferred_brands: List[BrandSignal] = Field(default_factory=list)
    preferred_products: List[ProductSignal] = Field(default_factory=list)
    preferred_categories: List[str] = Field(default_factory=list)
    price_preference: Optional[str] = None  # "budget_friendly", "balanced", "premium"
    household_size: Optional[int] = None


PREFERENCE_EXTRACTION_SYSTEM_PROMPT = """You are an invisible personalization extractor for a grocery e-commerce app.
Analyze the user's message and extract explicit grocery preferences, brand affinities, product likes, or product dislikes.

Rules:
1. ONLY extract explicitly stated user preferences.
2. If the user dislikes or wants to avoid a brand or product (e.g. "I don't like mushrooms", "Don't suggest Nestlé"), mark is_disliked = True.
3. If the user specifies a budget preference (e.g. "budget friendly", "affordable"), set price_preference = "budget_friendly".
4. Do not invent preferences not in the text.
"""


class PreferenceExtractorService:
    @classmethod
    def rule_based_extract(cls, text: str) -> ExtractedPreferences:
        """High-precision deterministic rule parser for offline / test safety."""
        clean = text.lower()
        brands = []
        products = []
        categories = []
        price_pref = None
        household = None

        # 1. Household size
        hh_match = re.search(r'(?:family of|household of|for)\s+(\d+)\s*(?:people|persons|members)?', clean)
        if hh_match:
            try:
                household = int(hh_match.group(1))
            except Exception:
                pass

        # 2. Price preference
        if any(w in clean for w in ["budget friendly", "cheap", "affordable", "low cost", "within budget"]):
            price_pref = "budget_friendly"
        elif any(w in clean for w in ["organic only", "premium", "best quality"]):
            price_pref = "premium"

        # 3. Disliked brands
        dislike_brand_match = re.search(
            r'(?:don\'t suggest|avoid|stop suggesting|hate|don\'t like)\s+([A-Z][a-zA-Z0-9\s]{2,15})(?:\s+brand|\s+milk|\s+oil)?',
            text
        )
        if dislike_brand_match:
            b_name = dislike_brand_match.group(1).strip()
            brands.append(BrandSignal(brand=b_name, confidence=0.98, is_disliked=True))

        # 4. Preferred brands
        pref_brand_match = re.search(
            r'(?:prefer|always buy|only buy|favourite is|we use)\s+([A-Z][a-zA-Z0-9\s]{2,15})(?:\s+brand|\s+milk|\s+oil|\s+bread|\s+butter)?',
            text
        )
        if pref_brand_match:
            b_name = pref_brand_match.group(1).strip()
            if not any(b.brand.lower() == b_name.lower() for b in brands):
                brands.append(BrandSignal(brand=b_name, confidence=0.95, is_disliked=False))

        # 5. Disliked products
        dislike_prod_match = re.search(
            r'(?:don\'t like|hate|avoid|allergic to|no)\s+(mushrooms|capsicum|onions|eggs|pork|beef|paneer|curd|coriander)',
            clean
        )
        if dislike_prod_match:
            p_name = dislike_prod_match.group(1).capitalize()
            products.append(ProductSignal(product_name=p_name, confidence=0.95, is_disliked=True))

        # 6. Preferred products
        pref_prod_match = re.search(
            r'(?:usually buy|love|prefer)\s+(whole wheat bread|brown rice|cow milk|green tea|almond milk)',
            clean
        )
        if pref_prod_match:
            p_name = pref_prod_match.group(1).title()
            products.append(ProductSignal(product_name=p_name, confidence=0.92, is_disliked=False))

        # 7. Categories
        for cat in ["Vegetables", "Dairy", "Grains", "Bakery", "Fruits"]:
            if cat.lower() in clean:
                categories.append(cat)

        return ExtractedPreferences(
            preferred_brands=brands,
            preferred_products=products,
            preferred_categories=categories,
            price_preference=price_pref,
            household_size=household,
        )

    @classmethod
    async def extract_preferences(cls, user_text: str) -> ExtractedPreferences:
        """Extract explicit user shopping preferences using LLM with rule fallback."""
        if not user_text or not user_text.strip():
            return ExtractedPreferences()

        try:
            result = await llm_service.generate_structured(
                system_prompt=PREFERENCE_EXTRACTION_SYSTEM_PROMPT,
                user_prompt=f"User message: {user_text}",
                response_model=ExtractedPreferences,
            )
            return result
        except Exception as e:
            logger.info(f"LLM preference extraction fallback: {e}")
            return cls.rule_based_extract(user_text)


preference_extractor = PreferenceExtractorService()
