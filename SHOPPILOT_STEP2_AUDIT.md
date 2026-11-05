# 🛒 ShopPilot — Step 2 Architecture & Code Audit Report
**Project:** FreshCart → ShopPilot (AI-Powered Autonomous Grocery Shopping Agent)  
**Date:** November 2026  
**Phase:** Step 2 — Build AI Shopping Intelligence  
**Author:** AI Systems Architect & Senior Full-Stack Engineer  

---

## 1. Executive Summary & Existing Architecture

The FreshCart project has successfully evolved through Step 1 into a robust full-stack ecommerce foundation powered by:
- **Backend:** Node.js + Express 5, Prisma ORM 6.4, PostgreSQL.
- **Frontend:** React 19, Vite, React Router DOM 7, Tailwind CSS, Lucide icons, Axios.
- **Catalog:** 231 authentic Indian grocery products in PostgreSQL with dual English/Hindi naming, images, categories, units, brands, `price` (MRP), `offerPrice` (selling price), `stockQuantity`, and `inStock`.
- **Existing Services:** `productService.js`, `cartService.js`, `inventoryService.js`.
- **Authentication:** Standard JWT auth header (`Bearer <token>`) with `authUser` and `optionalAuth` middlewares.

For Step 2, we introduce a dedicated **AI Microservice** built with **Python 3.11, FastAPI, LangGraph, and Pydantic**, interfacing with the existing Express backend and React frontend.

---

## 2. Reusable Express APIs and Services

The Express backend already exposes clean, modular service layers and REST endpoints that the AI microservice will consume:

| API / Service Method | Source File | Capability | Reusability in Step 2 |
|---|---|---|---|
| `productService.getAllProducts(filters)` | `server/services/productService.js` | Server-side filter by `search`, `category`, `brand`, `minPrice`, `maxPrice`, `inStockOnly` | **Core catalog search engine** for product matcher |
| `productService.getProductById(id)` | `server/services/productService.js` | Precise lookup with live `offerPrice` and `stockQuantity` | Single product verification |
| `productService.checkProductAvailability(id, qty)` | `server/services/productService.js` | Real-time stock verification against integer inventory | Inventory availability checks |
| `GET /api/products` | `server/routes/productRoutes.js` | Express endpoint returning filtered products | Public product query |
| `GET /api/products/:id` | `server/routes/productRoutes.js` | Express endpoint returning single product | Product detail query |
| `GET /api/categories` | `server/routes/categoryRoutes.js` | Returns 8 distinct departments with item counts | Category mapping & intent validation |
| `authUser.js` & `optionalAuth.js` | `server/middlewares/` | JWT token validation | Authenticating user requests in Express before routing to AI service |

### New Internal Endpoint Needed:
To support clean service-to-service communication with authorization:
- `GET /api/internal/ai/products/search?query=...&category=...&limit=...` secured via `x-internal-api-key`.
- `GET /api/internal/ai/products/:id` secured via `x-internal-api-key`.
- `POST /api/ai/chat` (Express proxy forwarder verifying JWT and proxying to FastAPI).
- `POST /api/ai/plan` (Express proxy forwarder).

---

## 3. Current Product Data Structure (Prisma / PostgreSQL)

Each product in PostgreSQL conforms to the `Product` model in `server/prisma/schema.prisma`:

```prisma
model Product {
  id            String      @id @default(uuid())      // e.g. "0123da66-da60-4ad7-aef8-340ea504f488"
  name          String                                // e.g. "कॉर्न फ्लेक्स / Kellogg's Corn Flakes 475g"
  description   String[]                              // bullet points array
  brand         String?                               // e.g. "Kellogg's", "Amul", "Generic"
  unit          String?                               // e.g. "475g", "500g", "1kg", "1L"
  offerPrice    Float                                 // Active selling price in INR (e.g. 235.0)
  price         Float                                 // MRP before discount in INR (e.g. 275.0)
  image         String[]                              // CDN URLs
  category      String                                // "Bakery", "Drinks", "Snacks", "Dairy", "Fruits", "Grains", "Instant", "Vegetables"
  inStock       Boolean     @default(true)
  stockQuantity Int         @default(50)
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### Critical Matching Insights:
1. **Catalog Categories:** The catalog contains 8 strict categories: `Bakery`, `Dairy`, `Drinks`, `Fruits`, `Grains`, `Instant`, `Snacks`, `Vegetables`.
2. **Dual-language Names:** Names often contain English brand/product plus Hindi translation (`मटर / Green Peas 500g`). The search query must handle both English grocery names (e.g., "Milk", "Rice", "Atta", "Potato") and case-insensitive matching.
3. **Selling Price Authority:** `offerPrice` is the actual customer purchase price, while `price` is MRP. Total budget calculations must strictly use `offerPrice`.
4. **Units & Package Sizing:** Units are specified as `500g`, `1kg`, `1L`, `475g`, etc. Package multipliers must be computed (e.g., 7 litres of milk $\rightarrow$ 14 packs of 500ml).

---

## 4. Recommended AI Service Architecture

The AI microservice will be organized cleanly in `ai-service/`:

```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app, CORS, lifespan, exception handlers
│   ├── config.py                   # Pydantic BaseSettings (env vars, defaults)
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py           # GET /api/ai/health
│   │       ├── chat.py             # POST /api/ai/chat
│   │       └── shopping_plan.py    # POST /api/ai/plan
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── intent.py               # ShoppingIntent Pydantic model
│   │   ├── grocery_plan.py         # GroceryItem, MatchedProduct, GroceryPlanResponse
│   │   └── chat.py                 # ChatRequest, ChatResponse, SessionState
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── state.py                # LangGraph AgentState TypedDict
│   │   ├── graph.py                # StateGraph workflow definition & conditional edges
│   │   └── nodes/
│   │       ├── __init__.py
│   │       ├── intent_extractor.py # LLM extraction + normalization (INR, 3k -> 3000)
│   │       ├── clarification.py    # Follow-up generation for missing requirements
│   │       ├── grocery_planner.py  # Structured grocery list generation
│   │       ├── product_matcher.py  # FreshCart catalog search & package calculation
│   │       ├── budget_validator.py # Decimal arithmetic, budget status & alternatives
│   │       └── response_generator.py # Conversational synthesis
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm_service.py          # Provider-agnostic abstraction (Gemini / OpenAI)
│   │   ├── catalog_service.py      # Async HTTP client to Express internal API
│   │   ├── quantity_service.py     # Deterministic sanity check on quantities & units
│   │   └── budget_service.py       # Budget computation and alternative recommendations
│   ├── prompts/
│   │   ├── __init__.py
│   │   ├── intent_prompt.py        # System prompt for intent extraction
│   │   └── grocery_planner_prompt.py
│   └── utils/
│       ├── __init__.py
│       └── validators.py           # Quantity, currency, and unit normalizers
├── tests/
│   ├── __init__.py
│   ├── test_intent_extractor.py
│   ├── test_grocery_planner.py
│   ├── test_product_matcher.py
│   ├── test_budget_validator.py
│   └── test_conversation_flow.py
├── requirements.txt
├── .env.example
└── README.md
```

### Communication Flow:
```
React Frontend (client:5173)
       │
       ▼ (authenticated with user JWT)
Express Backend (server:10000)
       │
       ▼ (service-to-service with INTERNAL_API_KEY)
FastAPI AI Microservice (ai-service:8000)
       │
       ├──► LLM Provider (Gemini / OpenAI structured output)
       └──► Express Internal Catalog API (server:10000/api/internal/ai/products)
```

---

## 5. Required Environment Variables

### Express Backend (`server/.env`):
```env
# Existing
PORT=10000
DATABASE_URL=postgresql://postgres:bcjklsb2786@localhost:5432/freshcart?schema=public
JWT_SECRET=supersecretjwtkey_change_me_12345
# ... other existing keys

# New for Step 2:
AI_SERVICE_URL=http://localhost:8000
INTERNAL_API_KEY=shoppilot_internal_secret_key_step2_2026
```

### AI Service (`ai-service/.env`):
```env
# AI Service Settings
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0
ENVIRONMENT=development

# LLM Provider Configuration ("gemini" or "openai")
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Express Backend Integration
EXPRESS_API_BASE_URL=http://localhost:10000
INTERNAL_API_KEY=shoppilot_internal_secret_key_step2_2026
```

---

## 6. Required New Files

### In `ai-service/`:
1. `requirements.txt`: `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `langgraph`, `langchain-core`, `langchain-google-genai`, `langchain-openai`, `httpx`, `pytest`, `pytest-asyncio`, `python-dotenv`.
2. `app/main.py`: FastAPI server setup with CORS, health, chat, and plan routers.
3. `app/config.py`: Configuration with pydantic-settings.
4. `app/schemas/intent.py`: `ShoppingIntent` schema.
5. `app/schemas/grocery_plan.py`: `GroceryItem`, `MatchedProduct`, `GroceryPlanResponse`.
6. `app/schemas/chat.py`: `ChatRequest`, `ChatResponse`.
7. `app/services/llm_service.py`: Provider abstraction (Gemini + OpenAI support).
8. `app/services/catalog_service.py`: Async HTTP client consuming Express APIs.
9. `app/services/quantity_service.py`: Rule-based quantity sanity checker.
10. `app/services/budget_service.py`: Decimal budget calculator and alternative proposer.
11. `app/agents/state.py` & `app/agents/graph.py`: LangGraph state machine with memory checkpointer.
12. `app/agents/nodes/*`: 6 modular LangGraph node handlers.
13. `tests/*`: 5 test suites covering intent extraction, planning, matching, budget validation, and multi-turn conversations.
14. `ai-service/README.md` & `ai-service/.env.example`.

### In `server/`:
1. `server/middlewares/internalAuth.js`: Middleware validating `x-internal-api-key`.
2. `server/routes/internalRoutes.js`: Exposing `/api/internal/ai/products/search` and `/api/internal/ai/products/:id`.
3. `server/routes/aiProxyRoutes.js`: Exposing `/api/ai/chat` and `/api/ai/plan`, forwarding client requests to the Python AI service.

### In `client/`:
1. `client/src/services/aiService.js`: Frontend API service connecting to `/api/ai`.
2. `client/src/components/ai/ShoppingAssistant.jsx`: Main assistant container.
3. `client/src/components/ai/ChatMessage.jsx`: Chat bubble component.
4. `client/src/components/ai/ChatInput.jsx`: Quick suggestions & input field.
5. `client/src/components/ai/IntentSummary.jsx`: Interactive badge panel of extracted requirements.
6. `client/src/components/ai/GroceryPlan.jsx`: Plan breakdown with quantities & priorities.
7. `client/src/components/ai/ProductRecommendation.jsx`: Catalog product card with stock & live price.
8. `client/src/components/ai/BudgetSummary.jsx`: Cost vs budget tracker with status tags.
9. Navigation integration in `Navbar.jsx` & route `/shopping-assistant` in `App.jsx`.

---

## 7. Potential Integration Risks & Solutions

1. **Currency & Unit Extraction Discrepancies:**
   - *Risk:* Users say "Rs 3000", "3k", "3000 INR", "3000/-".
   - *Solution:* Specialized regex + LLM normalization ensuring `budget: Decimal` and `currency: "INR"`.
2. **Missing Information vs Guessing:**
   - *Risk:* LLM hallucinating family size (e.g. assuming 4) when the user only said "I need groceries".
   - *Solution:* LangGraph conditional edge `check_missing_information`: if `family_size` or `duration_days` or `budget` is missing, branch to `ask_clarification`.
3. **Product Catalog Disconnect:**
   - *Risk:* LLM proposing foreign brands or nonexistent products (e.g., "Organic Grass-fed Butter 250g").
   - *Solution:* The LLM generates generic grocery terms (`Milk`, `Potatoes`, `Rice`, `Eggs`), which the Python `catalog_service` searches against FreshCart's real PostgreSQL database via Express. Only verified database products with genuine IDs, prices, and stock are matched.
4. **Service Downtime & Fallbacks:**
   - *Risk:* FastAPI service is starting or temporarily offline.
   - *Solution:* Express AI proxy handles timeouts and connection errors with friendly structured error responses (`503 AI Shopping Assistant is warming up`).
5. **Cross-Session Security:**
   - *Risk:* Session spoofing across users.
   - *Solution:* Express attaches authenticated user ID from JWT; conversation state is partitioned by `(user_id, conversation_id)`.

---

## 8. Implementation Plan

- **Phase 2:** Finalize audit & architecture (Completed).
- **Phase 3:** Create `ai-service/` skeleton, dependencies (`requirements.txt`), FastAPI application, configuration, and health check.
- **Phase 4:** Implement LLM service abstraction (supporting Gemini and OpenAI) and Pydantic `ShoppingIntent` model.
- **Phase 5:** Build LangGraph state machine with conditional clarification edges.
- **Phase 6:** Implement grocery planning and deterministic quantity validation service.
- **Phase 7:** Connect Express internal product APIs and Python catalog matching service.
- **Phase 8:** Implement budget validation using Decimal calculations.
- **Phase 9:** Connect Express proxy routes (`/api/ai/*`) with JWT auth and internal API keys.
- **Phase 10:** Build modern React UI (`/shopping-assistant`) with chat, intent cards, grocery plan, real product recommendations, and budget progress.
- **Phase 11:** Run comprehensive tests across all 5 modules and verify edge cases.
- **Phase 12:** Write documentation (`SHOPPILOT_STEP2_IMPLEMENTATION.md`, `ai-service/README.md`) and deliver final summary.

