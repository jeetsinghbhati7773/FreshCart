# 🛒 ShopPilot — Step 3 Architecture & Code Audit Report
**Project:** FreshCart → ShopPilot (AI-Powered Autonomous Grocery Shopping Agent)  
**Date:** November 2026  
**Phase:** Step 3 — Product Discovery & Smart Cart Optimization  
**Author:** AI Systems Architect & Senior Full-Stack Engineer  

---

## 1. Executive Summary & Existing Foundation

Through Steps 1 and 2, the application has established:
1. **Ecommerce Core (Step 1):**
   - Node.js + Express 5 backend with Prisma ORM 6.4 and PostgreSQL 16.
   - Authentic Indian catalog of **231 verified grocery products** across 8 departments.
   - Authoritative cart engine with server-side price calculation, 5% GST, savings tracker, and stock validation (`server/services/cartService.js`).
2. **AI Microservice (Step 2):**
   - Python 3.11 + FastAPI microservice running on port `8005` (avoiding port 8000 Docker conflicts).
   - Multi-provider LLM abstraction active with **Groq (`openai/gpt-oss-120b`)**, Gemini, and OpenAI with deterministic rule-based fallbacks.
   - LangGraph conversational engine with persistent thread checkpointing (`MemorySaver`).
   - Deterministic quantity sanity bounds (`QuantityService`) and Indian currency regex normalizer.
   - Internal authenticated Express endpoints (`/api/internal/ai/products/search`, `/:id`) guarded by `INTERNAL_API_KEY`.
   - Full React conversational shopping assistant at `/shopping-assistant`.

---

## 2. Existing Product Catalog & Database Schema

Every product in PostgreSQL conforms to the `Product` model in `server/prisma/schema.prisma`:

```prisma
model Product {
  id            String      @id @default(uuid())
  name          String
  description   String[]
  brand         String?
  unit          String?      // e.g. "500g", "1kg", "1L", "475g"
  offerPrice    Float        // Authoritative selling price in INR
  price         Float        // MRP before discount in INR
  image         String[]
  category      String       // Bakery, Dairy, Drinks, Fruits, Grains, Instant, Snacks, Vegetables
  inStock       Boolean     @default(true)
  stockQuantity Int         @default(50) @map("stock_quantity")
  isActive      Boolean     @default(true) @map("is_active")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### Key Catalog Insights:
- **8 Strict Departments:** `Bakery`, `Dairy`, `Drinks`, `Fruits`, `Grains`, `Instant`, `Snacks`, `Vegetables`.
- **Bilingual & Brand Naming:** Products frequently include Hindi names, English names, and packaging details (`"Potato / आलू (Potato) 1kg"`, `"Amul Taaza Toned Milk 500ml"`).
- **Package Sizing:** Products are sold in standardized packaged quantities (`500g`, `1kg`, `5kg`, `500ml`, `1L`, `250g`, `100g`, `packs`).
- **Inventory & Pricing:** The PostgreSQL database is the sole authority. `offerPrice` is the true consumer purchase price.

---

## 3. Current Search & Inventory Verification Capabilities

### What Works Now (from Step 2):
- `productService.getAllProducts(filters)` supports case-insensitive search across name, category, brand, and description array, with price ranges and pagination.
- `internalRoutes.js` exposes:
  - `GET /api/internal/ai/products/search?query=...&category=...&limit=...`
  - `GET /api/internal/ai/products/:id`
- `catalog_service.py` performs 1-to-1 matching using cleaned keywords and singular forms.

### Limitations to Overcome in Step 3:
1. **Single-product bias:** Step 2 picked only the first in-stock product, ignoring alternative brands, package economics, and multi-candidate comparisons.
2. **Missing Batch API:** Express lacks a single-request batch lookup `POST /api/internal/ai/products/batch` for retrieving multiple products simultaneously.
3. **Missing Batch Stock Validation:** No endpoint exists for the AI service to validate entire proposed carts against PostgreSQL transactions before presenting them to the user.
4. **No Multi-Criteria Ranking:** No weighted scoring model combining semantic similarity, package suitability, price per unit, brand preference, and stock health.
5. **No Alternative Product Finding:** When a product is out of stock or over budget, Step 2 produced a text note instead of discovering concrete structured alternatives (*exact*, *similar*, *budget-friendly*, *premium*).
6. **No Global Cart Optimization:** No global solver (knapsack/integer optimization) to guarantee maximum fulfillment within budget constraints while minimizing excess quantities and costs.

---

## 4. Channel3 & Elastic Evaluation

### Channel3 Integration Evaluation:
- **Reality Check:** Channel3 primarily indexes global Western retail platforms. It does not provide real-time Indian grocery stock, INR local pricing, or kirana retail catalogs.
- **Architectural Decision:** Implement a clean, resilient provider abstraction (`app/integrations/channel3_client.py`). If configured, it acts as an external product research/enrichment source. It **never** overrides PostgreSQL inventory or prices. When unconfigured, the system runs with zero performance degradation.

### Elastic Integration Evaluation:
- **Role:** An auxiliary search index for semantic/fuzzy search and keyword relevance across names and descriptions.
- **Authority Rule:** Elastic returns candidate product IDs only; Express + PostgreSQL revalidates live prices, active status, and real-time inventory.
- **Fallback Rule:** If Elastic is unreachable or unconfigured, the discovery engine immediately falls back to PostgreSQL full-text search via Express.

---

## 5. Existing AI Grocery Plan & Cart Architecture

### Input Plan Schema (`GroceryItem`):
```json
{
  "name": "Milk",
  "category": "Dairy",
  "estimated_quantity": 7.0,
  "unit": "litres",
  "priority": "essential",
  "reason": "Daily tea and household consumption"
}
```

### Express Cart Architecture:
- `POST /api/cart/items` adds individual items.
- `POST /api/cart/sync` merges offline cart items.
- In Step 3, we add a seamless `POST /api/cart/batch-add` endpoint in Express so the user can transfer their approved optimized cart directly to their real FreshCart cart with one click!

---

## 6. Recommended Step 3 Architecture

```
                      React Frontend (/shopping-assistant)
                                     │
                                     ▼
                      Express Backend (:10000)
                                     │
                                     ▼ (x-internal-api-key)
                      FastAPI AI Microservice (:8005)
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│       Product Discovery       │               │     Smart Cart Optimization   │
│  - Multi-candidate search     │               │  - Package optimizer          │
│  - Scoring & ranking (0.0-1.0)│  ──────────►  │  - Budget constraint solver   │
│  - Alternative finder         │               │  - Essential item priority    │
│  - Normalizer & conversions   │               │  - Excess quantity penalty    │
└───────────────────────────────┘               └──────────────┬────────────────┘
           ▲                                                   │
           │                                                   ▼
┌──────────┴────────────────────┐               ┌───────────────────────────────┐
│   Auxiliary Search / Enrich   │               │     Optimized Cart Result     │
│  - Elastic search index       │               │  - Itemized cost breakdown    │
│  - Channel3 external provider │               │  - Substitutions & savings    │
│  - PostgreSQL fallback        │               │  - Ready for customer review  │
└───────────────────────────────┘               └───────────────────────────────┘
```

---

## 7. Files to Create and Modify

### New Files in `ai-service/`:
1. `app/discovery/__init__.py`
2. `app/discovery/product_normalizer.py`: Unit conversions (kg $\leftrightarrow$ g, L $\leftrightarrow$ ml, dozen $\leftrightarrow$ pcs) and grocery synonyms.
3. `app/discovery/product_scorer.py`: Weighted multi-criteria scoring algorithm (semantic, category, package size, brand, price, stock).
4. `app/discovery/product_discovery.py`: Multi-candidate search engine with Elastic & PostgreSQL fallback.
5. `app/discovery/alternative_finder.py`: Categorizes alternatives (Exact, Similar, Budget-Friendly, Premium).
6. `app/optimization/__init__.py`
7. `app/optimization/optimization_models.py`: Pydantic models for `OptimizedCart`, `OptimizedItem`, `CostBreakdown`, `AlternativeOption`.
8. `app/optimization/package_optimizer.py`: Package multiplier calculation, excess quantity calculation, and shortage detection.
9. `app/optimization/budget_optimizer.py`: Global constraint optimization engine maximizing essential item fulfillment within budget.
10. `app/optimization/optimizer.py`: End-to-end cart optimization coordinator.
11. `app/integrations/__init__.py`
12. `app/integrations/provider_interface.py`: Base abstract class for discovery providers.
13. `app/integrations/channel3_client.py`: Channel3 integration with fallback.
14. `app/integrations/elastic_client.py`: Elasticsearch integration with fallback.
15. `app/api/routes/optimization.py`: Endpoints `POST /api/ai/discover-products`, `POST /api/ai/find-alternatives`, `POST /api/ai/optimize-cart`, `POST /api/ai/reoptimize-cart`.
16. Unit & Integration test suites in `ai-service/tests/`:
    - `test_discovery.py`
    - `test_package_calculations.py`
    - `test_alternatives.py`
    - `test_cart_optimizer.py`

### New & Modified Files in `server/`:
1. `server/routes/internalRoutes.js`:
   - Add `POST /api/internal/ai/products/batch`
   - Add `POST /api/internal/ai/inventory/validate`
2. `server/routes/aiProxyRoutes.js`:
   - Add proxy routes for `POST /api/ai/discover-products`, `POST /api/ai/find-alternatives`, `POST /api/ai/optimize-cart`, `POST /api/ai/reoptimize-cart`.
3. `server/routes/cartRoutes.js` & `server/controllers/cartController.js`:
   - Add `POST /api/cart/batch-add` allowing one-click transfer of the verified optimized cart to the persistent user cart!

### New & Modified Files in `client/`:
1. `client/src/services/aiService.js`: Add API callers for discovery, alternatives, optimization, and cart transfer.
2. `client/src/components/ai/OptimizedCart.jsx`: Interactive cart review table with package quantity modifiers, item removal, and lock buttons.
3. `client/src/components/ai/AlternativeModal.jsx`: Modal allowing customer to compare and swap recommended alternatives.
4. `client/src/components/ai/OptimizationSummary.jsx`: Detailed financial breakdown (subtotal, savings, remaining budget, fulfillment rate).
5. `client/src/components/ai/ShoppingAssistant.jsx`: Upgrade intelligence dashboard to render the interactive optimized cart, alternatives, and "Transfer to Cart" button.

---

## 8. Potential Integration Risks & Mitigations

1. **Rogue Product Pricing / Currency Discrepancies:**
   - *Mitigation:* Python AI service strictly uses `offerPrice` from PostgreSQL as Decimal. Express rejects any client-supplied prices.
2. **Package Size Discrepancies:**
   - *Mitigation:* Normalized unit parser standardizes metric measurements (`ml`, `L`, `g`, `kg`, `pcs`, `packs`). Non-convertible dimensions flag for customer clarification.
3. **Over-Budget Feasibility Traps:**
   - *Mitigation:* Global optimizer prioritizes essential items first. If total cost exceeds budget, it automatically evaluates lower-cost substitutes and drops optional items while explaining the trade-off.
4. **External Provider Downtime (Elastic / Channel3):**
   - *Mitigation:* Built-in failover to PostgreSQL Express APIs ensures 100% operational continuity.

---

## 9. Implementation Plan (Phase by Phase)

- **Phase 1: Audit & Foundation (Done)**
- **Phase 2: Product Discovery & Scoring** — Multi-candidate search, keyword stemming, and configurable scoring model.
- **Phase 3: Package & Unit Normalization** — Metric conversions, package counts, and excess quantity math.
- **Phase 4: Alternative Recommender Engine** — Out-of-stock and budget-overrun substitution logic (Exact, Similar, Budget-friendly, Premium).
- **Phase 5: Global Smart Cart Optimizer** — Budget-constrained integer optimizer prioritizing essential staples.
- **Phase 6: Optional Channel3 & Elastic Integrations** — Provider abstractions with robust fallbacks.
- **Phase 7: LangGraph Workflow Enhancement** — New graph nodes and state parameters.
- **Phase 8: Express Backend Integration** — Batch product query, inventory validation, and batch cart addition.
- **Phase 9: React Conversational UI Upgrade** — Interactive optimized cart, alternative swapping modal, budget breakdown, and 1-click cart addition.
- **Phase 10: Automated Testing & Verification** — Complete pytest suite and Vite build verification.
- **Phase 11: Final Documentation & Report** — Delivery of `SHOPPILOT_STEP3_IMPLEMENTATION.md`.

