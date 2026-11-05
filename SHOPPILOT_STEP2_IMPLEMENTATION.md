# 🛒 ShopPilot — Step 2 Implementation Report: AI Shopping Intelligence
**Project:** FreshCart → ShopPilot (AI-Powered Autonomous Grocery Shopping Agent)  
**Date:** November 2026  
**Status:** Completed & Verified  

---

## 1. Executive Summary

Step 2 has evolved FreshCart into **ShopPilot** by introducing a dedicated **Python + FastAPI + LangGraph AI microservice** that connects to the existing React frontend and Express + Prisma/PostgreSQL ecommerce backend.

Customers can now interact with an autonomous shopping assistant that:
1. Understands natural language requests (e.g. *"I need groceries for a family of four for seven days within ₹3,000"*).
2. Extracts structured `ShoppingIntent` with normalized Indian currency (₹, Rs, 3k, INR).
3. Detects missing critical information and conversationally asks targeted follow-up questions.
4. Generates household-scaled grocery lists with metric units, priorities, and reasons.
5. Uses deterministic business rules (`QuantityService`) to cap quantities and prevent hallucinations.
6. Queries the real FreshCart catalog via Express APIs to match live products with verified IDs, images, package multipliers, and live stock.
7. Evaluates budgets using Decimal arithmetic, flags budget overruns, and suggests cost optimizations.
8. Displays live intelligence in a responsive React interface with interactive badges, grocery cards, product cards, and budget tracking.

---

## 2. Architecture Implemented

```
                     ┌─────────────────────────────┐
                     │   React 19 Frontend (Vite)  │
                     │    Port: 5173 (client)      │
                     └──────────────┬──────────────┘
                                    │ (JWT Auth)
                                    ▼
                     ┌─────────────────────────────┐
                     │ Express 5 Backend (Node.js) │
                     │   Port: 10000 (server)      │
                     └──────┬──────────────────────┘
                            │ (x-internal-api-key)
                            ▼
           ┌──────────────────────────────────────────────┐
           │        FastAPI AI Microservice (Python)      │
           │              Port: 8000 (ai-service)         │
           │                                              │
           │  ┌────────────────────────────────────────┐  │
           │  │            LangGraph Engine            │  │
           │  │  1. extract_intent                     │  │
           │  │  2. check_missing_info (conditional)  │  │
           │  │     ├─► ask_clarification              │  │
           │  │     └─► generate_grocery_list          │  │
           │  │  3. match_products (via Express API)   │  │
           │  │  4. validate_budget (Decimal math)     │  │
           │  │  5. generate_response                  │  │
           │  └────────────────────────────────────────┘  │
           │                                              │
           │  ├── LLM Service (Gemini / OpenAI provider)  │
           │  └── Quantity Service (Deterministic Bounds) │
           └──────────────────────────────────────────────┘
```

---

## 3. Files Created and Modified

### AI Microservice (`ai-service/`):
- `ai-service/requirements.txt`: FastAPI, Uvicorn, LangGraph, LangChain, Pydantic, HTTPX, Pytest.
- `ai-service/.env.example` & `ai-service/.env`: AI service settings, LLM provider, Express URL, internal API key.
- `ai-service/pytest.ini`: Pytest configuration with pythonpath and asyncio auto mode.
- `ai-service/app/main.py`: FastAPI application, CORS, lifecycle management, global error handler.
- `ai-service/app/config.py`: Settings management using Pydantic `BaseSettings`.
- `ai-service/app/schemas/intent.py`: Pydantic `ShoppingIntent` model.
- `ai-service/app/schemas/grocery_plan.py`: `GroceryItem`, `MatchedProduct`, `GroceryPlanResponse`.
- `ai-service/app/schemas/chat.py`: `ChatRequest`, `ChatResponse`, `PlanRequest`.
- `ai-service/app/services/llm_service.py`: Provider abstraction (Groq / Gemini / OpenAI) with fallback engine.
- `ai-service/app/services/catalog_service.py`: HTTP client interfacing with Express catalog endpoints.
- `ai-service/app/services/quantity_service.py`: Deterministic quantity and unit sanity bounds.
- `ai-service/app/services/budget_service.py`: Decimal financial computation and alternative proposer.
- `ai-service/app/utils/validators.py`: Indian currency regex parser, category/unit normalizers.
- `ai-service/app/prompts/intent_prompt.py`: System prompts for intent extraction & follow-up clarification.
- `ai-service/app/prompts/grocery_planner_prompt.py`: System prompts for staple planning & concierge explanation.
- `ai-service/app/agents/state.py`: LangGraph `AgentState` TypedDict.
- `ai-service/app/agents/graph.py`: LangGraph `StateGraph` workflow with conditional branching and memory checkpointer.
- `ai-service/app/agents/nodes/intent_extractor.py`: Intent extraction node with rule-based fallback.
- `ai-service/app/agents/nodes/clarification.py`: Clarification node for missing information.
- `ai-service/app/agents/nodes/grocery_planner.py`: Grocery list generation node.
- `ai-service/app/agents/nodes/product_matcher.py`: Real catalog product matcher node.
- `ai-service/app/agents/nodes/budget_validator.py`: Budget validator node.
- `ai-service/app/agents/nodes/response_generator.py`: Response generator node.
- `ai-service/app/api/routes/health.py`: `GET /api/ai/health`.
- `ai-service/app/api/routes/chat.py`: `POST /api/ai/chat`.
- `ai-service/app/api/routes/shopping_plan.py`: `POST /api/ai/plan`.
- `ai-service/tests/conftest.py`: Test fixtures mocking external LLM calls.
- `ai-service/tests/test_intent_extractor.py`: Intent parsing and currency tests.
- `ai-service/tests/test_grocery_planner.py`: Quantity validation and bounds tests.
- `ai-service/tests/test_product_matcher.py`: Stock and package multiplier tests.
- `ai-service/tests/test_budget_validator.py`: Decimal budget math and overrun suggestions tests.
- `ai-service/tests/test_conversation_flow.py`: Single-turn and multi-turn conversation flow tests.
- `ai-service/README.md`: Microservice architecture and setup guide.

### Express Backend (`server/`):
- `server/middlewares/internalAuth.js`: Protected middleware validating `x-internal-api-key`.
- `server/routes/internalRoutes.js`: Dedicated endpoints `/api/internal/ai/products/search` and `/:id`.
- `server/routes/aiProxyRoutes.js`: Forwarding proxy for `/api/ai/chat` and `/api/ai/plan` with timeouts and fallback handling.
- `server/server.js`: Mounted internal routes and AI proxy routes.
- `server/.env`: Added `AI_SERVICE_URL` and `INTERNAL_API_KEY`.

### React Frontend (`client/`):
- `client/src/services/aiService.js`: API client for chatting, planning, and health checks.
- `client/src/components/ai/ShoppingAssistant.jsx`: Full-featured AI assistant page with responsive chat + intelligence split-view.
- `client/src/components/ai/ChatMessage.jsx`: Chat bubbles with avatar, timestamps, and formatting.
- `client/src/components/ai/ChatInput.jsx`: Quick suggestion chips, input field, and loading states.
- `client/src/components/ai/IntentSummary.jsx`: Interactive badge panel showing family size, duration, budget, and dietary preferences.
- `client/src/components/ai/GroceryPlan.jsx`: List of household staples with quantities, metric units, priority, and reasons.
- `client/src/components/ai/ProductRecommendation.jsx`: Real catalog cards with package counts, live offer prices, and stock indicators.
- `client/src/components/ai/BudgetSummary.jsx`: Financial tracker with total cost, target budget, remaining buffer/overrun, progress bar, and tips.
- `client/src/App.jsx`: Registered route `/shopping-assistant`.
- `client/src/components/Navbar.jsx`: Added AI Assistant link with sparkle badge in desktop and mobile navigation.

---

## 4. Verification and Test Results

### 1. Pytest Automated Test Suite
All 16 unit and integration test suites pass in **0.96 seconds**:
```
tests/test_budget_validator.py::test_budget_within_limit PASSED          [  6%]
tests/test_budget_validator.py::test_budget_exceeded PASSED              [ 12%]
tests/test_conversation_flow.py::test_full_request_single_turn PASSED    [ 18%]
tests/test_conversation_flow.py::test_multi_turn_conversation_clarification_then_update PASSED [ 25%]
tests/test_conversation_flow.py::test_multi_turn_budget_adjustment PASSED [ 31%]
tests/test_grocery_planner.py::test_planner_family_of_two_three_days PASSED [ 37%]
tests/test_grocery_planner.py::test_planner_family_of_four_seven_days PASSED [ 43%]
tests/test_grocery_planner.py::test_quantity_service_bounds_clamping PASSED [ 50%]
tests/test_intent_extractor.py::test_intent_all_details_provided PASSED  [ 56%]
tests/test_intent_extractor.py::test_intent_monthly_groceries_two_people PASSED [ 62%]
tests/test_intent_extractor.py::test_intent_budget_categories PASSED     [ 68%]
tests/test_intent_extractor.py::test_intent_vegetarian_five_people PASSED [ 75%]
tests/test_intent_extractor.py::test_intent_vague_request_triggers_clarification PASSED [ 81%]
tests/test_intent_extractor.py::test_indian_currency_expressions PASSED  [ 87%]
tests/test_product_matcher.py::test_package_multiplier_calculation PASSED [ 93%]
tests/test_product_matcher.py::test_match_item_stock_sufficiency PASSED  [100%]

============================= 16 passed in 0.96s ==============================
```

### 2. Frontend Production Build
`npm run build` executed via Vite 7 transformed 1856 modules into optimized production bundles with **0 errors**.

### 3. Database Catalog Integrity
Prisma confirmed all **231 authentic Indian grocery products** are accessible with valid `unit`, `brand`, `offerPrice`, and `stockQuantity` fields.

---

## 5. How to Run the Full Application

### Terminal 1: Start Express Backend
```powershell
cd server
npm run dev
# Running on http://localhost:10000
```

### Terminal 2: Start FastAPI AI Microservice
```powershell
cd ai-service
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
# Running on http://localhost:8000 (OpenAPI docs at http://localhost:8000/docs)
```

### Terminal 3: Start React Frontend
```powershell
cd client
npm run dev
# Running on http://localhost:5173
```

Navigate to: `http://localhost:5173/shopping-assistant`

---

## 6. Step 3 Roadmap (Autonomous Cart & PayPal Integration)
In Step 3, the proposed grocery plan will transition to execution:
1. One-click batch addition of matched products to the authoritative server-side cart.
2. PayPal Smart Payment Buttons integration for order checkout.
3. Inventory decrement and order confirmation pipeline.

