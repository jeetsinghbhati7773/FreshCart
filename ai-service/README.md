# 🤖 ShopPilot — AI Shopping Microservice

ShopPilot AI is an autonomous grocery shopping microservice built with **Python 3.11, FastAPI, LangGraph, and Pydantic**. It translates conversational customer grocery shopping requirements into structured shopping intents, validates household quantities with deterministic business rules, queries the live FreshCart PostgreSQL catalog via Express APIs, and tracks budgets with Decimal precision.

---

## 🏗️ Architecture

```
React Frontend (client:5173)
       │
       ▼ (authenticated with user JWT)
Express Backend (server:10000)
       │
       ▼ (service-to-service with INTERNAL_API_KEY)
FastAPI AI Microservice (ai-service:8000)
       │
       ├──► LLM Provider (Google Gemini / OpenAI with structured schema enforcement)
       └──► Express Internal Catalog API (server:10000/api/internal/ai/products)
```

### LangGraph Workflow

```
Customer Message
       │
       ▼
Extract Intent (Pydantic ShoppingIntent)
       │
       ▼
Check Missing Information
       │
       ├──► [Missing key params] ──► Ask Clarification (Wait for customer follow-up)
       │
       └──► [Fully specified]
              │
              ▼
       Generate Grocery List (Staples scaled to household size & days)
              │
              ▼
       Match FreshCart Products (Query PostgreSQL via Express APIs)
              │
              ▼
       Validate Budget (Decimal arithmetic & alternative suggestions)
              │
              ▼
       Generate Response (Concierge explanation)
              │
              ▼
       Return to UI
```

---

## 🚀 Setup & Installation (Windows PowerShell)

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ (for Express backend and React frontend)
- PostgreSQL running with FreshCart database

### 2. Virtual Environment Setup
```powershell
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

Configure your LLM provider in `ai-service/.env`:
```env
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0
ENVIRONMENT=development

# LLM Provider ("groq", "gemini", or "openai")
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

EXPRESS_API_BASE_URL=http://localhost:10000
INTERNAL_API_KEY=shoppilot_internal_secret_key_step2_2026
```

### 4. Running the AI Microservice
```powershell
uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://localhost:8000/docs`

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```powershell
pytest -v
```
Tests automatically mock external LLM and network calls, ensuring fast, cost-free validation.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai/health` | Service health and provider configuration |
| `POST` | `/api/ai/chat` | Main conversational shopping workflow |
| `POST` | `/api/ai/plan` | Direct grocery plan generation from intent |
| `GET` | `/docs` | Interactive OpenAPI Swagger UI |

