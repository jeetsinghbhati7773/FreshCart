from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class ProductProvider(ABC):
    """
    Standard interface for candidate search and catalog lookup providers.
    Guarantees consistent data structure regardless of search backend.
    """

    @abstractmethod
    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Search products matching query and category."""
        pass

    @abstractmethod
    async def get_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve exact product by identifier."""
        pass

