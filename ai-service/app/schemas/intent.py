from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class ShoppingIntent(BaseModel):
    family_size: Optional[int] = Field(
        default=None,
        description="Number of people in the household to plan groceries for.",
    )
    duration_days: Optional[int] = Field(
        default=None,
        description="Number of days the groceries should last (e.g. 7 for a week, 30 for a month).",
    )
    budget: Optional[Decimal] = Field(
        default=None,
        description="Maximum budget allocated for the grocery order.",
    )
    currency: str = Field(
        default="INR",
        description="Currency code (e.g. INR).",
    )
    dietary_preferences: List[str] = Field(
        default_factory=list,
        description="Dietary preferences such as vegetarian, vegan, halal, jain, gluten-free.",
    )
    excluded_ingredients: List[str] = Field(
        default_factory=list,
        description="Specific ingredients or allergens the customer wants to avoid.",
    )
    preferred_brands: List[str] = Field(
        default_factory=list,
        description="Preferred brands such as Amul, Aashirvaad, Tata, Britannia.",
    )
    categories: List[str] = Field(
        default_factory=list,
        description="Categories requested, e.g. vegetables, dairy, grains, snacks, fruits.",
    )
    shopping_goal: Optional[str] = Field(
        default=None,
        description="High level goal: e.g. 'weekly grocery shopping', 'monthly restock', 'party snacks'.",
    )
    additional_notes: Optional[str] = Field(
        default=None,
        description="Any other customer notes or context.",
    )
    missing_fields: List[str] = Field(
        default_factory=list,
        description="Crucial fields missing before a reliable grocery plan can be formed.",
    )
    requires_clarification: bool = Field(
        default=False,
        description="True if key information is missing and customer should be asked a follow-up question.",
    )
    confidence: float = Field(
        default=1.0,
        description="Confidence score between 0.0 and 1.0 for the extracted intent.",
    )

