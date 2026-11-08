# 🛒 ShopPilot — AI-Powered Autonomous Grocery Shopping Agent

> **Built for PayPal AI Hackathon**  
> *Evolving FreshCart into an autonomous, intelligent grocery procurement platform.*

---

## 🚀 Overview

**ShopPilot** is an autonomous grocery shopping platform engineered with a decoupled service architecture, PostgreSQL database, authoritative cart management, and interactive OpenAPI documentation.

### 🌟 Step 1: Shopping Foundation (Complete)
- **Active Database:** Local **PostgreSQL 16** managed via **Prisma ORM 6.4**.
- **Authentic Indian Catalog:** **231 verified products** across 8 grocery categories with high-res images, dual English/Hindi naming, brands, units, and inventory tracking.
- **Service Layer Architecture:** Decoupled business logic (`productService.js`, `cartService.js`, `inventoryService.js`) designed for direct AI agent integration.
- **Authoritative Cart Engine:** Server-side cart with automatic GST (5%) calculation, savings tracker, stock checks, and guest/user session merging.
- **Interactive OpenAPI 3.0 Documentation:** Live at `http://localhost:10000/api/docs`.
- **Modern React 19 Frontend:** Vite 7, Tailwind CSS v3, category filter pills, price range filtering, real-time cart badge, and smooth SPA navigation.

### 🤖 Step 2: AI Shopping Intelligence (Complete)
- **Python AI Microservice:** FastAPI + LangGraph state machine with persistent thread checkpointing.
- **Structured Intent Extraction:** Converts natural-language requests into strongly typed Pydantic models with Indian currency normalization (₹, Rs, 3k).
- **Targeted Clarification:** Identifies missing household parameters and asks friendly conversational follow-ups without guessing.
- **Deterministic Quantity Bounds:** Rule-based household scaling (`QuantityService`) enforcing safe consumption limits and metric units.
- **Zero-Hallucination Catalog Matching:** Queries live FreshCart PostgreSQL products via Express internal APIs, computing package multipliers (e.g. 7L milk -> 14x 500ml packs) and validating inventory.
- **Decimal Budget Precision:** Accurate budget tracking, overrun detection, and intelligent cost reduction suggestions.
- **Conversational UI:** Dedicated `/shopping-assistant` page with chat stream, intent summary badges, grocery plan breakdown, matched real products, and budget utilization tracker.

### ⚡ Step 3: Product Discovery & Smart Cart Optimization (Complete)
- **Autonomous Product Discovery Engine:** Multi-query expansion, singular/plural stemming, parenthetical normalization, and multi-criteria candidate scoring:
  $$\text{Score} = 0.35 \times S_{\text{semantic}} + 0.20 \times S_{\text{category}} + 0.15 \times S_{\text{package}} + 0.10 \times S_{\text{brand}} + 0.10 \times S_{\text{price}} + 0.10 \times S_{\text{stock}}$$
- **Package Size & Quantity Math:** Integer package multipliers ($\lceil \text{req} / \text{pkg\_size} \rceil$), supplied vs required calculation, excess percentage tracking, and stock shortage warnings.
- **Alternative Recommendation Engine:** Automated detection and classification of alternatives (`exact`, `similar`, `budget_friendly`, `premium`, `unresolved`) with category compatibility and dietary constraint enforcement.
- **Smart Budget Optimizer:** Constrained integer optimization maximizing essential fulfillment, swapping in budget-friendly alternatives when costs exceed target budget, and computing detailed financial breakdowns.
- **1-Click Cart Transfer:** Direct batch addition (`POST /api/cart/batch-add`) transferring proposed items directly into the user's FreshCart cart session.
- **Floating Bottom-Right Chatbot Widget:** Accessible anywhere across the store via an interactive floating widget (`AiChatWidget.jsx`) with quick-prompt chips, inline cart preview, and 1-click checkout transfer.
- **Interactive UI Components:** `OptimizedCart.jsx` table, `AlternativeModal.jsx` for 1-click product swapping, and `OptimizationSummary.jsx` with savings breakdown.
- **31 Automated Tests:** 100% test pass rate across unit conversion, candidate scoring, package math, alternatives classification, and budget optimization.

---

## 📦 Product Catalog Breakdown (231 Total)

| Category | Count | Sample Brands & Staples |
|---|---|---|
| 🍫 **Snacks & Chocolates** | 61 | Lay's, Kurkure, Bingo, Doritos, Cadbury, KitKat, Ferrero Rocher, Lindt |
| 🌾 **Grains & Flours** | 27 | Sharbati Wheat, Basmati Rice, Sona Masoori, Ragi, Bajra, Jowar, Oats, Quinoa |
| 🥤 **Drinks & Beverages** | 25 | Thums Up, Maaza, Red Bull, Sting, Rooh Afza, Tata Tea, Nescafe |
| 🍎 **Fruits** | 25 | Kela (Banana), Anaar, Seb, Kesar Aam, Kiwi, Tender Coconut, Dragon Fruit |
| 🥦 **Vegetables** | 25 | Aloo, Tamatar, Pyaz, Bhindi, Gobhi, Palak, Methi, Ginger, Garlic |
| 🍜 **Instant Foods** | 24 | Maggi 2-Min, Double Masala, MTR Poha & Upma, Haldiram's RTE, iD Malabar Paratha |
| 🥛 **Dairy & Eggs** | 22 | Amul Taaza Milk, Malai Paneer, Masti Dahi, Butter, Mother Dairy, Eggs |
| 🍞 **Bakery & Breads** | 22 | English Oven Milk Bread, Modern White, Whole Wheat, Pav Bhaji Pav, Baguettes |

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 19** + **Vite 7**
- **React Router DOM v7** (SPA routing)
- **Tailwind CSS v3**
- **Axios** (interceptor-based auth tokens)
- **React Context API** (`AppContext.jsx`)
- **Socket.IO Client** (real-time seller chat)
- **React Hot Toast** + **React Icons** + **Lucide React**

### Backend (`server/`)
- **Node.js (ES Modules)** + **Express v5**
- **Prisma ORM 6.4** + **PostgreSQL**
- **Decoupled Services:** `productService`, `cartService`, `inventoryService`
- **Authentication:** JWT + bcrypt
- **Payments:** Razorpay + Stripe (PayPal integration in Step 4)
- **Cloud Services:** Cloudinary (image uploads), Nodemailer (OTP / notifications)
- **Documentation:** Interactive OpenAPI 3.0 via Swagger UI at `/api/docs`

---

## 💻 Local Windows & PowerShell Setup

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- PostgreSQL 14+ running locally on port 5432 with database `freshcart`

### AI Microservice (`ai-service/`)
- **Python 3.11** + **FastAPI** + **Uvicorn**
- **LangGraph** (StateGraph with conditional edges and MemorySaver)
- **LangChain** (Google Gemini & OpenAI provider abstractions)
- **Pydantic v2** (Structured output models & BaseSettings)
- **HTTPX** (Asynchronous HTTP client for Express APIs)
- **Pytest** + **Pytest-Asyncio**

### 1. Express Backend Setup
```powershell
cd server
npm install
# Ensure .env has DATABASE_URL, JWT_SECRET, PORT=10000
npx prisma db push
npx prisma generate
npm run dev
```
*Backend runs on `http://localhost:10000`.*  
*Interactive Swagger docs available at `http://localhost:10000/api/docs`.*

### 2. AI Microservice Setup
```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copy .env.example to .env and configure LLM_PROVIDER (e.g. groq, gemini, or openai)
uvicorn app.main:app --reload --port 8005
```
*AI service runs on `http://localhost:8005` (docs at `http://localhost:8005/docs`).*

### 3. Frontend Setup
```powershell
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Verification & Automated Testing

Run the Step 1 automated test suite:
```powershell
cd server
node test/step1Verify.js
```

### Test Coverage (100% Passing):
- [x] Categories API (`/api/categories`)
- [x] Full catalog listing (`/api/products`)
- [x] Multi-keyword search (`?search=Maggi`)
- [x] Department filtering (`?category=Dairy`)
- [x] Price boundary filtering (`?minPrice=50&maxPrice=100`)
- [x] Product details retrieval (`/api/products/:id`)
- [x] Empty cart initialization (`/api/cart`)
- [x] Cart addition & stock checks (`/api/cart/items`)
- [x] Quantity adjustments & recalculations
- [x] Pre-checkout inventory verification (`/api/cart/validate`)
- [x] Item removal & cart clearance
- [x] OpenAPI 3.0 specification (`/api/docs/openapi.json`)
### AI Microservice Automated Test Coverage (31 Passed in 1.92s):
```powershell
cd ai-service
pytest -v
```
- [x] **Discovery & Text Normalization:** Query cleaning (`Curd (Plain Yogurt)` $\rightarrow$ `Curd`), singularization (`Potatoes` $\rightarrow$ `potato`), package parsing (`1kg`, `500g`, `1L`, `500ml`).
- [x] **Candidate Scoring Formula:** Semantic, category, package suitability, brand, and stock composite rating.
- [x] **Package Size & Excess Math:** Exact matches, fractional requirements, metric unit conversions, and stock limitations.
- [x] **Alternative Classification:** Exact matches, budget-friendly savings, premium upgrades, category compatibility, and out-of-stock exclusions.
- [x] **Budget Optimizer:** Real-time MRP/savings calculations, automated budget substitution, and overage detection.
- [x] **Intent Extraction & Household Scaling:** Pydantic model validation, currency normalization (`₹`, `Rs`, `3k`), and consumption bounds.
- [x] **Conversational Memory:** Stateful multi-turn clarification and budget updates.

---

## 📡 API Endpoints Reference

### AI Proxy & Optimization APIs (Port 10000 / 8005)
| Endpoint | Method | Description |
|---|---|---|
| `/api/ai/health` | `GET` | Health check proxy for FastAPI microservice |
| `/api/ai/chat` | `POST` | Conversational shopping concierge with LangGraph + Cart Optimizer |
| `/api/ai/optimize-cart` | `POST` | Discovers products, calculates packages, and optimizes cart under budget |
| `/api/ai/reoptimize-cart` | `POST` | Swaps product with alternative and recalculates totals dynamically |
| `/api/ai/find-alternatives`| `POST` | Classifies in-stock replacements (exact, budget, premium, similar) |
| `/api/cart/batch-add` | `POST` | 1-Click transfer adding proposed items into user's FreshCart cart |
| `/api/internal/ai/products/batch` | `POST` | Bulk lookup of multiple products by ID array |
| `/api/internal/ai/inventory/validate` | `POST` | Bulk stock and live price validation |

---

## 🔒 Security
- Database credentials and secrets are kept strictly in `.env` and excluded via `.gitignore`.
- Template configuration available in `server/.env.example` and `ai-service/.env.example`.
