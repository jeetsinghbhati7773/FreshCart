import re
from typing import Optional, Tuple


class ProductNormalizer:
    """
    Standardizes text queries, removes packaging clutter, singularizes terms,
    and normalizes units (kg, g, L, ml, pcs) into uniform comparative units.
    """

    PLURAL_IRREGULARS = {
        "potatoes": "potato",
        "tomatoes": "tomato",
        "onions": "onion",
        "apples": "apple",
        "eggs": "egg",
        "bananas": "banana",
        "lemons": "lemon",
        "carrots": "carrot",
        "chillies": "chilli",
        "chilis": "chilli",
        "mangoes": "mango",
        "oranges": "orange",
        "breads": "bread",
        "biscuits": "biscuit",
    }

    UNIT_CONVERSIONS = {
        # Weight to kg
        "kg": ("kg", 1.0),
        "kgs": ("kg", 1.0),
        "kilo": ("kg", 1.0),
        "kilogram": ("kg", 1.0),
        "kilograms": ("kg", 1.0),
        "g": ("kg", 0.001),
        "gm": ("kg", 0.001),
        "gms": ("kg", 0.001),
        "gram": ("kg", 0.001),
        "grams": ("kg", 0.001),
        # Volume to litres
        "l": ("litres", 1.0),
        "ltr": ("litres", 1.0),
        "litre": ("litres", 1.0),
        "litres": ("litres", 1.0),
        "liter": ("litres", 1.0),
        "liters": ("litres", 1.0),
        "ml": ("litres", 0.001),
        "milli": ("litres", 0.001),
        "millilitre": ("litres", 0.001),
        # Discrete items
        "pcs": ("pcs", 1.0),
        "pc": ("pcs", 1.0),
        "piece": ("pcs", 1.0),
        "pieces": ("pcs", 1.0),
        "pack": ("packs", 1.0),
        "packs": ("packs", 1.0),
        "packet": ("packs", 1.0),
        "packets": ("packs", 1.0),
        "box": ("packs", 1.0),
        "dozen": ("pcs", 12.0),
    }

    @classmethod
    def clean_query_text(cls, text: str) -> str:
        """
        Removes parenthetical descriptions, brand prefixes, and noise.
        e.g. 'Curd (Plain Yogurt)' -> 'Curd'
        e.g. 'Atta (Whole Wheat Flour)' -> 'Atta'
        """
        if not text:
            return ""
        # Remove parentheses and their contents
        cleaned = re.sub(r"\(.*?\)", "", text)
        # Remove punctuation except hyphens
        cleaned = re.sub(r"[^\w\s-]", " ", cleaned)
        # Collapse multiple spaces
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @classmethod
    def singularize(cls, term: str) -> str:
        """
        Converts plural grocery terms to singular canonical form.
        e.g. 'Potatoes' -> 'Potato', 'Onions' -> 'Onion'
        """
        term_lower = term.strip().lower()
        if term_lower in cls.PLURAL_IRREGULARS:
            return cls.PLURAL_IRREGULARS[term_lower]
        if term_lower.endswith("ies") and len(term_lower) > 4:
            return term_lower[:-3] + "y"
        if term_lower.endswith("es") and len(term_lower) > 3:
            return term_lower[:-2]
        if term_lower.endswith("s") and not term_lower.endswith("ss") and len(term_lower) > 3:
            return term_lower[:-1]
        return term_lower

    @classmethod
    def parse_package_size(cls, unit_str: Optional[str], product_name: str) -> Tuple[float, str]:
        """
        Extracts numerical package size and canonical unit.
        Returns: (size_in_canonical_unit, canonical_unit)
        e.g. '500g' -> (0.5, 'kg')
        e.g. '1 L Tetra Pak' -> (1.0, 'litres')
        e.g. '6 pcs' -> (6.0, 'pcs')
        """
        combined = f"{unit_str or ''} {product_name}".lower()

        # Look for weight: kg, g
        kg_m = re.search(r"(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilogram)", combined)
        if kg_m:
            return float(kg_m.group(1)), "kg"

        g_m = re.search(r"(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram)", combined)
        if g_m:
            return float(g_m.group(1)) / 1000.0, "kg"

        # Look for volume: L, ml
        l_m = re.search(r"(\d+(?:\.\d+)?)\s*(?:l|ltr|litre|litres|liter)", combined)
        if l_m:
            return float(l_m.group(1)), "litres"

        ml_m = re.search(r"(\d+(?:\.\d+)?)\s*(?:ml|milli)", combined)
        if ml_m:
            return float(ml_m.group(1)) / 1000.0, "litres"

        # Look for discrete counts / dozen
        dozen_m = re.search(r"(\d+(?:\.\d+)?)\s*dozen", combined)
        if dozen_m:
            return float(dozen_m.group(1)) * 12.0, "pcs"

        pcs_m = re.search(r"(\d+(?:\.\d+)?)\s*(?:pcs|pc|piece|pieces|pack|packs)", combined)
        if pcs_m:
            return float(pcs_m.group(1)), "pcs"

        return 1.0, "pcs"

    @classmethod
    def standardize_quantity(cls, quantity: float, unit: str) -> Tuple[float, str]:
        """
        Converts given quantity and unit to canonical base unit (kg, litres, pcs).
        """
        unit_lower = unit.strip().lower()
        if unit_lower in cls.UNIT_CONVERSIONS:
            base_unit, multiplier = cls.UNIT_CONVERSIONS[unit_lower]
            return quantity * multiplier, base_unit
        return quantity, unit_lower
