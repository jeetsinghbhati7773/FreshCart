from typing import List, Tuple
from app.schemas.grocery_plan import GroceryItem
from app.utils.validators import normalize_category, normalize_unit, VALID_UNITS


class QuantityService:
    """
    Deterministic rule-based service to validate and enforce reasonable bounds
    on LLM-proposed grocery items, units, and quantities.
    """

    # Maximum reasonable consumption caps per person per day
    MAX_PER_PERSON_DAY = {
        "Grains": 0.5,       # kg per person-day
        "Dairy": 0.75,       # litres / kg per person-day
        "Vegetables": 0.6,   # kg per person-day
        "Fruits": 0.4,       # kg per person-day
        "Bakery": 0.25,      # kg per person-day (or ~1 loaf per 2 person-days)
        "Snacks": 0.2,       # kg per person-day
        "Drinks": 0.5,       # litres per person-day
        "Instant": 0.25,     # kg per person-day
    }

    MIN_QUANTITY = {
        "kg": 0.25,
        "g": 100.0,
        "litres": 0.5,
        "ml": 200.0,
        "packs": 1.0,
        "pcs": 1.0,
    }

    @classmethod
    def validate_and_sanitize(
        cls,
        items: List[GroceryItem],
        family_size: int = 4,
        duration_days: int = 7,
    ) -> List[GroceryItem]:
        """
        Sanitize, deduplicate, and enforce deterministic quantity bounds.
        """
        person_days = max(1, family_size) * max(1, duration_days)
        sanitized: List[GroceryItem] = []
        seen_names = set()

        for item in items:
            name_lower = item.name.strip().lower()
            if not name_lower or name_lower in seen_names:
                continue
            seen_names.add(name_lower)

            # 1. Normalize Category
            cat = normalize_category(item.category) or "Grains"

            # 2. Normalize Unit
            unit = normalize_unit(item.unit)
            if unit not in VALID_UNITS:
                unit = "packs"

            # 3. Ensure positive quantity
            raw_qty = float(item.estimated_quantity)
            if raw_qty <= 0:
                raw_qty = cls.MIN_QUANTITY.get(unit, 1.0)

            # 4. Household-scale upper bounding
            max_daily_rate = cls.MAX_PER_PERSON_DAY.get(cat, 0.5)
            if unit in ["kg", "litres"]:
                upper_bound = round(person_days * max_daily_rate, 1)
                # Allow a generous 50% cushion over daily rate for bulk items
                ceiling = max(cls.MIN_QUANTITY.get(unit, 0.5), upper_bound * 1.5)
                if raw_qty > ceiling:
                    raw_qty = ceiling
                elif raw_qty < cls.MIN_QUANTITY.get(unit, 0.5):
                    raw_qty = cls.MIN_QUANTITY.get(unit, 0.5)
            elif unit in ["g", "ml"]:
                upper_bound = person_days * max_daily_rate * 1000
                ceiling = max(cls.MIN_QUANTITY.get(unit, 100.0), upper_bound * 1.5)
                if raw_qty > ceiling:
                    raw_qty = ceiling
                elif raw_qty < cls.MIN_QUANTITY.get(unit, 100.0):
                    raw_qty = cls.MIN_QUANTITY.get(unit, 100.0)
            elif unit in ["packs", "pcs"]:
                max_packs = max(1, int(person_days / 2))
                if raw_qty > max_packs:
                    raw_qty = float(max_packs)

            sanitized.append(
                GroceryItem(
                    name=item.name.strip().title(),
                    category=cat,
                    estimated_quantity=round(raw_qty, 2),
                    unit=unit,
                    priority="essential" if item.priority == "essential" else "optional",
                    reason=item.reason.strip() or f"Standard household recommendation for {cat}",
                )
            )

        return sanitized

