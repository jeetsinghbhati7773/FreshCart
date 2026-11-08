import re
from decimal import Decimal, InvalidOperation
from typing import Optional, Set

VALID_CATEGORIES = {
    "Bakery",
    "Dairy",
    "Drinks",
    "Fruits",
    "Grains",
    "Instant",
    "Snacks",
    "Vegetables",
}

CATEGORY_SYNONYMS = {
    "vegetable": "Vegetables",
    "vegetables": "Vegetables",
    "veggies": "Vegetables",
    "sabzi": "Vegetables",
    "dairy": "Dairy",
    "milk": "Dairy",
    "cheese": "Dairy",
    "paneer": "Dairy",
    "dahi": "Dairy",
    "yogurt": "Dairy",
    "grain": "Grains",
    "grains": "Grains",
    "flour": "Grains",
    "atta": "Grains",
    "rice": "Grains",
    "dal": "Grains",
    "pulses": "Grains",
    "fruit": "Fruits",
    "fruits": "Fruits",
    "snack": "Snacks",
    "snacks": "Snacks",
    "biscuit": "Snacks",
    "biscuits": "Snacks",
    "chocolate": "Snacks",
    "drink": "Drinks",
    "drinks": "Drinks",
    "beverage": "Drinks",
    "beverages": "Drinks",
    "juice": "Drinks",
    "tea": "Drinks",
    "coffee": "Drinks",
    "bakery": "Bakery",
    "bread": "Bakery",
    "toast": "Bakery",
    "instant": "Instant",
    "noodles": "Instant",
    "ready to eat": "Instant",
    "maggi": "Instant",
}

VALID_UNITS = {"kg", "g", "litres", "l", "ml", "packs", "pcs"}


def normalize_category(cat: str) -> Optional[str]:
    """Map arbitrary user/category string to canonical FreshCart category."""
    if not cat:
        return None
    cleaned = cat.strip().lower()
    if cleaned in CATEGORY_SYNONYMS:
        return CATEGORY_SYNONYMS[cleaned]
    # Check if capitalized version exists in valid categories
    for vc in VALID_CATEGORIES:
        if vc.lower() == cleaned:
            return vc
    return None


def parse_indian_budget(text: str) -> Optional[Decimal]:
    """
    Parses currency strings like '₹3000', 'Rs. 3000', '3k rupees', '3,000 INR', '1500'
    into a positive Decimal value.
    """
    if not text:
        return None

    cleaned = str(text).strip().lower()

    # Check for '3k', '2.5k', etc.
    k_match = re.search(r'(\d+(?:\.\d+)?)\s*k(?:\s*(?:rupees|rs|inr|₹))?', cleaned)
    if k_match:
        try:
            val = float(k_match.group(1)) * 1000
            return Decimal(str(int(val)))
        except (ValueError, InvalidOperation):
            pass

    # 2. Check for currency marker prefix: ₹3000, Rs. 1500, Rs 2000, inr 3000
    prefix_m = re.search(r'(?:₹|rs\.?|inr)\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)', cleaned)
    if prefix_m:
        try:
            return Decimal(prefix_m.group(1).replace(',', ''))
        except (ValueError, InvalidOperation):
            pass

    # 3. Check for currency marker suffix: 3000 rupees, 1500 rs, 3000 inr
    suffix_m = re.search(r'(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:rupees|rs\.?|inr|₹)', cleaned)
    if suffix_m:
        try:
            return Decimal(suffix_m.group(1).replace(',', ''))
        except (ValueError, InvalidOperation):
            pass

    # 4. Check for context words: budget 2000, within 3000, have 1500
    context_m = re.search(r'(?:budget|within|under|have|around|approx|limit|max|up to)(?:\s*(?:of|is|to))?\s*(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)', cleaned)
    if context_m:
        try:
            return Decimal(context_m.group(1).replace(',', ''))
        except (ValueError, InvalidOperation):
            pass

    return None


def normalize_unit(unit: str) -> str:
    """Normalize unit string to canonical representation."""
    if not unit:
        return "pcs"
    u = unit.strip().lower()
    if u in ["liter", "litre", "litres", "ltr", "l"]:
        return "litres"
    if u in ["kilogram", "kilograms", "kg", "kgs"]:
        return "kg"
    if u in ["gram", "grams", "g", "gm", "gms"]:
        return "g"
    if u in ["milliliter", "millilitre", "ml"]:
        return "ml"
    if u in ["pack", "packs", "pkt", "pkts", "packet", "packets"]:
        return "packs"
    if u in ["piece", "pieces", "pc", "pcs"]:
        return "pcs"
    return u
