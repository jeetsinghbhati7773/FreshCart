from decimal import Decimal
import math
from typing import Any, Dict, Optional, Tuple
from app.discovery.product_normalizer import ProductNormalizer


class PackageOptimizationResult:
    """Stores calculated package count, supplied vs required quantity, and excess math."""

    def __init__(
        self,
        required_quantity: float,
        required_unit: str,
        package_size: float,
        package_unit: str,
        required_packages: int,
        supplied_quantity: float,
        excess_quantity: float,
        excess_percentage: float,
        unit_price: Decimal,
        subtotal: Decimal,
        is_in_stock: bool,
        available_stock: int,
        fulfillable_packages: int,
        shortage_packages: int,
    ):
        self.required_quantity = required_quantity
        self.required_unit = required_unit
        self.package_size = package_size
        self.package_unit = package_unit
        self.required_packages = required_packages
        self.supplied_quantity = supplied_quantity
        self.excess_quantity = excess_quantity
        self.excess_percentage = excess_percentage
        self.unit_price = unit_price
        self.subtotal = subtotal
        self.is_in_stock = is_in_stock
        self.available_stock = available_stock
        self.fulfillable_packages = fulfillable_packages
        self.shortage_packages = shortage_packages

    def to_dict(self) -> Dict[str, Any]:
        return {
            "required_quantity": self.required_quantity,
            "required_unit": self.required_unit,
            "package_size": self.package_size,
            "package_unit": self.package_unit,
            "required_packages": self.required_packages,
            "supplied_quantity": self.supplied_quantity,
            "excess_quantity": self.excess_quantity,
            "excess_percentage": round(self.excess_percentage, 1),
            "unit_price": str(self.unit_price),
            "subtotal": str(self.subtotal),
            "is_in_stock": self.is_in_stock,
            "available_stock": self.available_stock,
            "fulfillable_packages": self.fulfillable_packages,
            "shortage_packages": self.shortage_packages,
        }


class PackageOptimizer:
    """
    Computes exact package multipliers, excess quantities, and stock constraints
    with guaranteed non-negative values and Decimal financial arithmetic.
    """

    @classmethod
    def calculate_packages(
        cls,
        required_quantity: float,
        required_unit: str,
        product: Dict[str, Any],
    ) -> PackageOptimizationResult:
        """
        Calculates how many packages of `product` are required to fulfill
        the requirement, tracking excess quantities and inventory sufficiency.
        """
        prod_name = product.get("name", "")
        pkg_size_raw, pkg_unit_raw = ProductNormalizer.parse_package_size(
            product.get("unit"), prod_name
        )

        std_req_qty, std_req_unit = ProductNormalizer.standardize_quantity(
            required_quantity, required_unit
        )
        std_pkg_size, std_pkg_unit = ProductNormalizer.standardize_quantity(
            pkg_size_raw, pkg_unit_raw
        )

        # Safety fallback if units differ (e.g. piece vs kg)
        if std_req_unit != std_pkg_unit or std_pkg_size <= 0:
            packages_needed = max(1, math.ceil(required_quantity))
            supplied_qty = float(packages_needed)
            excess_qty = max(0.0, supplied_qty - required_quantity)
            excess_pct = (excess_qty / max(0.001, required_quantity)) * 100.0
            display_pkg_size = 1.0
            display_pkg_unit = "pcs"
        else:
            packages_needed = max(1, math.ceil(std_req_qty / std_pkg_size))
            supplied_qty = packages_needed * std_pkg_size
            excess_qty = max(0.0, supplied_qty - std_req_qty)
            excess_pct = (excess_qty / max(0.001, std_req_qty)) * 100.0
            display_pkg_size = pkg_size_raw
            display_pkg_unit = pkg_unit_raw

        # Price calculation with Decimal
        offer_price_val = product.get("offerPrice", product.get("price", 0))
        unit_price = Decimal(str(offer_price_val))

        # Stock availability
        stock_qty = int(product.get("stockQuantity", 50))
        in_stock_flag = bool(product.get("inStock", True) and stock_qty > 0)

        fulfillable_packs = min(packages_needed, stock_qty) if in_stock_flag else 0
        shortage_packs = max(0, packages_needed - fulfillable_packs)

        subtotal = unit_price * Decimal(str(fulfillable_packs if fulfillable_packs > 0 else packages_needed))

        return PackageOptimizationResult(
            required_quantity=required_quantity,
            required_unit=required_unit,
            package_size=display_pkg_size,
            package_unit=display_pkg_unit,
            required_packages=packages_needed,
            supplied_quantity=round(supplied_qty, 2),
            excess_quantity=round(excess_qty, 2),
            excess_percentage=round(excess_pct, 1),
            unit_price=unit_price,
            subtotal=subtotal,
            is_in_stock=in_stock_flag,
            available_stock=stock_qty,
            fulfillable_packages=fulfillable_packs,
            shortage_packages=shortage_packs,
        )
