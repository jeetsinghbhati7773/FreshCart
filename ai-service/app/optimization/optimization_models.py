from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class OptimizedItem(BaseModel):
    requirement_name: str
    product_id: str
    product_name: str
    category: str
    brand: Optional[str] = None
    package_size: Optional[str] = None
    image_url: Optional[str] = None
    unit_price: Decimal
    mrp_price: Decimal
    package_count: int
    required_quantity: float
    required_unit: str
    supplied_quantity: float
    excess_quantity: float
    excess_percentage: float
    subtotal: Decimal
    is_in_stock: bool
    available_stock: int
    stock_sufficient: bool
    priority: str = "essential"  # essential, optional, preference
    selection_reason: str
    is_substitution: bool = False
    original_product_name: Optional[str] = None
    available_alternatives: List[Dict[str, Any]] = Field(default_factory=list)


class CostBreakdown(BaseModel):
    mrp_total: Decimal
    subtotal: Decimal
    total_savings: Decimal
    estimated_tax: Decimal
    final_total: Decimal
    budget: Optional[Decimal] = None
    remaining_budget: Optional[Decimal] = None
    budget_status: str  # within_budget, exceeded, exact, not_specified
    budget_difference: Decimal


class OptimizationMetrics(BaseModel):
    total_requirements: int
    fulfilled_requirements: int
    unresolved_requirements: int
    total_packages: int
    average_excess_percentage: float
    substitutions_made: int


class OptimizedCart(BaseModel):
    conversation_id: str
    items: List[OptimizedItem]
    unresolved_items: List[str] = Field(default_factory=list)
    breakdown: CostBreakdown
    metrics: OptimizationMetrics
    recommendations: List[str] = Field(default_factory=list)


class OptimizationRequest(BaseModel):
    conversation_id: Optional[str] = "default-session"
    grocery_items: List[Dict[str, Any]]
    budget: Optional[Decimal] = None
    dietary_preferences: List[str] = Field(default_factory=list)
    preferred_brands: List[str] = Field(default_factory=list)


class SwapItemRequest(BaseModel):
    conversation_id: Optional[str] = "default-session"
    current_cart: OptimizedCart
    target_product_id: str
    replacement_product_id: str
