# ShopPilot – Step 3: Product Discovery & Smart Cart Optimization Implementation Report

## 1. Executive Summary

Step 3 evolves **ShopPilot** from a conversational grocery planner into an autonomous **Product Discovery & Smart Cart Optimization Engine** for the PayPal AI Hackathon.

The system translates high-level household grocery requirements into an optimal, budget-constrained shopping cart matched directly against FreshCart's authoritative PostgreSQL product catalog (231 products) with zero hallucinations.

---

## 2. Architecture & Design Principles

### Core Architecture
```
React Frontend (Vite, Port 5173)
       │
       ▼
Express API & Proxy (Port 10000)
       │
       ├───► PostgreSQL (Prisma ORM, 231 Products & CartItems)
       │
       ▼
FastAPI AI Microservice (Port 8005)
       │
       ├───► LangGraph Agent Workflow
       ├───► Product Discovery Engine (Multi-Query + Stemming + Scorer)
       ├───► Package Size & Quantity Optimizer (Integer Math & Decimal Arithmetic)
       ├───► Alternative Finder (Exact, Similar, Budget-Friendly, Premium)
       ├───► Global Budget Optimizer (Constrained Integer Programming)
       └───► Integrations Abstraction (Channel3, Elastic, PostgreSQL Primary)
```

### Key Guarantees
1. **Zero Price Hallucinations:** All item pricing uses authoritative `offerPrice` and `price` from PostgreSQL.
2. **Stock Truth:** All selections and package counts are validated against live `stockQuantity` and `inStock` flags.
3. **Financial Precision:** Python `Decimal` is strictly used for all financial calculations, discounts, and subtotals.
4. **Customer Approval:** Proposed optimized carts are never automatically committed to checkout; the user can inspect alternatives, review excess quantities, and transfer items into FreshCart with one click.

---

## 3. Implemented Components

### 3.1 Product Discovery Engine (`ai-service/app/discovery/`)
- **`product_normalizer.py`:**
  - Cleans parenthetical descriptors (`Curd (Plain Yogurt)` $\rightarrow$ `Curd`, `Atta (Whole Wheat Flour)` $\rightarrow$ `Atta`).
  - Singularizes plural terms (`Potatoes` $\rightarrow$ `potato`, `Tomatoes` $\rightarrow$ `tomato`, `Onions` $\rightarrow$ `onion`).
  - Parses and standardizes units and package sizes (`kg`, `g`, `litres`, `ml`, `pcs`, `dozen`).
- **`product_scorer.py`:**
  - Evaluates candidates using the multi-criteria composite formula:
    $$Score = 0.35 \times S_{semantic} + 0.20 \times S_{category} + 0.15 \times S_{package} + 0.10 \times S_{brand} + 0.10 \times S_{price} + 0.10 \times S_{stock}$$
- **`product_discovery.py`:**
  - Multi-candidate search per requirement: searches using canonical name, stemmed keyword, category filter, and cross-category fallback.
  - Returns top scored candidates per grocery requirement.

### 3.2 Package Size & Quantity Optimizer (`ai-service/app/optimization/package_optimizer.py`)
- Calculates required packages: $\lceil \text{required\_quantity} / \text{package\_size} \rceil$.
- Calculates supplied quantity: $\text{package\_count} \times \text{package\_size}$.
- Calculates excess quantity: $\max(0, \text{supplied\_quantity} - \text{required\_quantity})$.
- Calculates excess percentage: $(\text{excess\_quantity} / \text{required\_quantity}) \times 100\%$.
- Enforces stock constraints: checks live PostgreSQL stock and reports shortages.

### 3.3 Alternative Product Recommendation Engine (`ai-service/app/discovery/alternative_finder.py`)
- Automatically triggers when an item is out of stock, has insufficient inventory, or exceeds target budget.
- Classifies alternatives into 5 categories:
  - **Exact:** Same product type, alternative brand or identical pack size.
  - **Budget-Friendly:** Lower unit-price option within category saving money.
  - **Premium:** Higher grade / organic equivalent.
  - **Similar:** Functionally equivalent staple in same category.
  - **Unresolved:** When no valid alternative meets category/dietary constraints.
- Rejects cross-category substitutions (e.g. replacing Rice with Milk) and dietary violations.

### 3.4 Smart Cart Optimizer (`ai-service/app/optimization/`)
- **`budget_optimizer.py`:** Global budget-constrained optimizer prioritizing essential items, automatically evaluating budget alternatives when cost exceeds budget, and penalizing excess quantities.
- **`optimizer.py`:** High-level orchestrator connecting discovery, package sizing, alternatives, and budget optimization.

### 3.5 External Integrations (`ai-service/app/integrations/`)
- **`provider_interface.py`:** Abstract Base Class `ProductProvider`.
- **`channel3_client.py`:** Channel3 external enrichment client with automatic fallback to PostgreSQL.
- **`elastic_client.py`:** Elasticsearch full-text client with automatic fallback to PostgreSQL.

### 3.6 Express Backend APIs
- `GET /api/ai/health`: Real-time health proxy.
- `POST /api/internal/ai/products/batch`: Bulk lookup of multiple products by ID array.
- `POST /api/internal/ai/inventory/validate`: Bulk validation of stock and current prices.
- `POST /api/ai/optimize-cart`: Proxies cart optimization request to FastAPI.
- `POST /api/ai/reoptimize-cart`: Proxies item swap / reoptimization request to FastAPI.
- `POST /api/cart/batch-add`: 1-Click transfer of AI proposed items directly into FreshCart `CartItem` table.

### 3.7 React Frontend UI (`client/src/components/ai/`)
- **`OptimizedCart.jsx`:** Interactive proposed cart table with product images, package math, unit prices, excess quantity badges, stock badges, and substitution notes.
- **`AlternativeModal.jsx`:** Modal displaying alternative options with category badges, price differences, and 1-click swap.
- **`OptimizationSummary.jsx`:** Complete financial breakdown (MRP total, savings, subtotal, budget status, shortfall/remaining) and the "Add All Items to FreshCart" button.
- **`ShoppingAssistant.jsx`:** Integrated with `AppContext` and `aiService.js`.

---

## 4. Verification and Test Results

### 4.1 Automated Python Test Suite
31 automated test cases passing in 1.92s:
- `tests/test_discovery.py`: Unit cleaning, singularization, package size parsing, standardization, scoring.
- `tests/test_package_calculations.py`: Exact package match, fractional requirements, unit conversions, stock limitations.
- `tests/test_alternatives.py`: Exact, budget-friendly, similar, category rejection, out-of-stock rejection.
- `tests/test_cart_optimizer.py`: Budget breakdown calculation, automated budget-friendly substitution.
- `tests/test_intent_extractor.py`: Intent extraction, currency parsing, missing fields.
- `tests/test_grocery_planner.py`: Quantity bounds clamping, staple generation.
- `tests/test_product_matcher.py`: Product matching, package multipliers.
- `tests/test_conversation_flow.py`: Multi-turn stateful clarification and budget adjustments.

### 4.2 Frontend Production Build
`npm run build` in `client`:
- Vite 7 production bundle created in 26.96s with zero errors or warnings.

### 4.3 End-to-End Live API Verification
- `POST /api/ai/optimize-cart`: Successfully optimized 4 grocery requirements within ₹1,000 budget, returning ₹784.00 total with ₹216.00 remaining budget and classified alternatives for each item.
- `POST /api/cart/batch-add`: Successfully transferred proposed items into the customer's FreshCart cart session.

