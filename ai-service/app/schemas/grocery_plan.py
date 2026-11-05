from decimal import Decimal
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class GroceryItem(BaseModel):
    name: str = Field(description="Name of the staple/grocery item, e.g. 'Rice', 'Milk', 'Potatoes'")
    category: str = Field(description="Catalog category: 'Grains', 'Dairy', 'Vegetables', 'Fruits', 'Bakery', 'Drinks', 'Instant', 'Snacks'")
    estimated_quantity: float = Field(description="Estimated quantity needed for the household and duration")
    unit: str = Field(description="Standard metric unit: 'kg', 'g', 'litres', 'ml', 'packs', 'pcs'")
    priority: Literal["essential", "optional"] = Field(default="essential", description="'essential' or 'optional'")
    reason: str = Field(description="Brief reason explaining why this item and quantity are recommended")


class MatchedProduct(BaseModel):
    grocery_item_name: str
    product_id: str
    product_name: str
    category: str
    brand: Optional[str] = None
    package_size: Optional[str] = None
    offer_price: Decimal
    mrp_price: Decimal
    image_url: Optional[str] = None
    package_count: int = Field(default=1, description="Number of catalog packages required to meet estimated quantity")
    item_subtotal: Decimal = Field(description="package_count * offer_price")
    in_stock: bool
    available_stock: int
    stock_sufficient: bool = True
    shortage_note: Optional[str] = None


class GroceryPlanResponse(BaseModel):
    items: List[GroceryItem] = Field(default_factory=list)
    matched_products: List[MatchedProduct] = Field(default_factory=list)
    estimated_total: Decimal = Field(default=Decimal("0.0"))
    budget: Optional[Decimal] = None
    budget_difference: Decimal = Field(default=Decimal("0.0"), description="budget - estimated_total (positive means under budget, negative means overrun)")
    budget_status: Literal["within_budget", "exceeded", "not_specified"] = "not_specified"
    suggestions: List[str] = Field(default_factory=list)

