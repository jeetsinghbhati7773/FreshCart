# ShopPilot (FreshCart) – Seller AI Agent Architecture & Audit

**Date:** 2026-11-12  
**Scope:** Phase 1 Repository Audit & Proposed Integration Architecture (Read-Only Audit — No source files modified)

---

## 1. Existing Architecture

FreshCart (rebranded as **ShopPilot** in the UI) is a three-tier full-stack grocery ecommerce platform with an existing customer-facing AI microservice:

1. **Frontend (`client/`):**
   - React 19 + Vite 7 + Tailwind CSS + React Router DOM + Axios + React Hot Toast.
   - HTTP clients in `client/src/utils/axiosInstance.js`:
     - `userAxios`: reads `localStorage.getItem("token")`.
     - `sellerAxios`: reads `localStorage.getItem("sellerToken")`.
   - Customer AI UI already exists under `client/src/components/ai/` (`ShoppingAssistant.jsx`, `AiChatWidget.jsx`, etc.), communicating with Express via `client/src/services/aiChatService.js`.
   - Seller Dashboard lives at `client/src/pages/Seller.jsx` (guarded by `client/src/pages/ProtectedSellerRoute.jsx`), with four tabs: `AddItems`, `ManageStock`, `Orders`, and `SellerUserChats`.

2. **Primary Ecommerce Backend (`server/`):**
   - Node.js (ESM `"type": "module"`) + Express 5 (`^5.1.0`) + Prisma ORM (`6.4.1`) + PostgreSQL + JWT (`jsonwebtoken`) + Socket.IO (`^4.8.1`).
   - Entry point: `server/server.js` (default `PORT=10000`).
   - Houses all ecommerce domain logic, Prisma models (`server/prisma/schema.prisma`), payment integrations (PayPal, Razorpay, Stripe), webhooks (`/api/webhooks/paypal`), internal AI endpoints (`/api/internal/ai`), and AI proxy routes (`/api/ai`).

3. **Existing AI Microservice (`ai-service/`):**
   - Python FastAPI + LangGraph (`langgraph>=0.2.0`) + LangChain (`langchain-core`, `langchain-google-genai`, `langchain-openai`, `langchain-groq`) running on port `8005` (`AI_SERVICE_URL=http://localhost:8005`).
   - Currently powers the **customer** ShopPilot Shopping Concierge (`/api/ai/health`, `/api/ai/chat`, `/api/ai/shopping-plan`, `/api/ai/cart-optimization`) via `ai-service/app/main.py` and `ai-service/app/services/llm_service.py` (configurable `LLM_PROVIDER`: `gemini`, `openai`, or `groq`).
   - Authenticates to Express internal routes (`/api/internal/ai/*`) using the shared `x-internal-api-key` header (`INTERNAL_API_KEY`) verified by `server/middlewares/internalAuth.js`.
   - Note: `mcp` is **not** yet installed in `ai-service/requirements.txt`.

---

## 2. Existing Seller Authentication Flow

1. **Credentials & Token Issuance (`server/controllers/sellerController.js`):**
   - `loginSeller` (`POST /api/seller/login`) validates `email` and `password` directly against environment variables `process.env.SELLER_EMAIL` and `process.env.SELLER_PASSWORD` (e.g., `admin@freshcart.com`).
   - There is **no `Seller` model** in `server/prisma/schema.prisma` and no `sellerId` foreign key on `Product` or `Order`. The system currently models a single store-wide admin/seller account.
   - Upon match, it signs a JWT `{ email }` with `process.env.JWT_SECRET` (`expiresIn: "7d"`).

2. **Backend Middleware (`server/middlewares/authSeller.js`):**
   - Reads `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, checks `tokenDecode.email === process.env.SELLER_EMAIL`, sets `req.user = tokenDecode`, and calls `next()`. Returns `401` on missing/invalid token and `403` on non-seller email.

3. **Frontend Route Guard (`client/src/pages/ProtectedSellerRoute.jsx` & `client/src/context/AppContext.jsx`):**
   - `ProtectedSellerRoute` reads `localStorage.getItem("sellerToken")` and calls `GET /api/seller/check-auth` with the Bearer header; on failure, redirects to `/seller-login`.
   - Note: `client/src/context/AppContext.jsx` initializes `isSeller` to `true` by default, so route protection relies on `ProtectedSellerRoute` verifying `/seller/check-auth`.

4. **Observed Auth Security Gaps in Existing Routes:**
   - In `server/routes/sellerRoutes.js`, `POST /api/seller/add-product`, `GET /api/seller/products`, and `PUT /api/seller/update/:id` do **not** have `authSeller` middleware attached (only `/check-auth` and `/update-order-status/:id` use `authSeller`).
   - In `server/routes/orders.js`, `GET /api/orders/all` (`getAllOrdersForSeller`) has **no** `authSeller` middleware.
   - `client/src/components/Seller/ManageStock.jsx` uses raw `axios` instead of `sellerAxios`, sending no `Authorization` header.

---

## 3. Current Order Lifecycle and Valid Order Statuses

1. **Schema Defaults (`server/prisma/schema.prisma`):**
   - `Order.status`: `String @default("Order Received")`
   - `Order.paymentStatus`: `String @default("Pending")`

2. **Observed Status Values in Seller UI (`client/src/components/Seller/Orders.jsx`):**
   - The UI dropdown defines four statuses:
     1. `"Order Received"`
     2. `"Packing"`
     3. `"Out for Delivery"`
     4. `"Delivered"`
   - `"Cancelled"` is not yet included in the UI dropdown or validated in backend transitions.

3. **Order Creation & Payment Separation (`server/controllers/orderController.js` & `server/routes/webhookRoutes.js`):**
   - `createOrder` (`POST /api/orders`) validates inventory via `validateCartInventory`, computes `subtotal` + 5% `gst`, creates the `Order` and `OrderItem` rows inside `prisma.$transaction`, decrements stock via `adjustStock(item.product, -item.quantity, tx)`, and clears the user's cart.
   - `updateOrderStatus` (`PUT /api/seller/update-order-status/:id` and `orderController.js`) currently performs an **unvalidated** `prisma.order.update({ where: { id }, data: { status } })` with:
     - No state-transition validation (arbitrary status strings are accepted).
     - No cancellation stock restoration (`adjustStock` is not called on cancel).
   - `paymentStatus` is managed by payment controllers (`paypalController.js`) and verified webhook handlers (`POST /api/webhooks/paypal` via `PayPalWebhookService`), **not** by `updateOrderStatus`.

---

## 4. Existing Inventory Management Logic

1. **Stock Fields on `Product` (`server/prisma/schema.prisma`):**
   - `inStock`: `Boolean @default(true)`
   - `stockQuantity`: `Int @default(50) @map("stock_quantity")`
   - `isActive`: `Boolean @default(true) @map("is_active")`
   - **Missing:** No `lowStockThreshold`, `safetyStock`, `leadTimeDays`, or `targetStockLevel` fields exist on `Product`.

2. **Inventory Service (`server/services/inventoryService.js`):**
   - `checkStock(productId)`: returns `{ available, stockQuantity, inStock, isActive, product }` where `available = product.isActive && product.inStock && product.stockQuantity > 0`.
   - `getAvailableQuantity(productId)`: returns `stockQuantity` if available, else `0`.
   - `validateCartInventory(items)`: validates requested quantities against `stockQuantity` and `isActive`.
   - `adjustStock(productId, delta, client = prisma)`: computes `newQuantity = Math.max(0, product.stockQuantity + delta)` and updates `stockQuantity` and `inStock`.

3. **Inventory Reservations (`server/prisma/schema.prisma` & `server/services/reservationService.js`):**
   - `InventoryReservation` tracks `orderId`, `productId`, `reservedQuantity`, `status` (`"RESERVED"`), and `expiresAt`.

4. **Product Service & Seller Stock UI (`server/services/productService.js` & `client/src/components/Seller/ManageStock.jsx`):**
   - `productService.updateProduct(id, data)` supports updating `stockQuantity` (automatically setting `inStock = stockQuantity > 0`), `inStock`, `offerPrice`, `price`, `isActive`, etc.
   - However, `ManageStock.jsx` currently only exposes inline editing for `offerPrice` and `inStock` (boolean) — it does **not** display or edit `stockQuantity`, and references `product._id` instead of Prisma's `product.id`.

---

## 5. Existing Product and Order Prisma Models

From `server/prisma/schema.prisma`:

- **`Product` (`@@map("products")`):**
  - `id` (UUID PK), `name` (String), `description` (String[]), `brand` (String?), `unit` (String?), `offerPrice` (Float), `price` (Float), `image` (String[]), `category` (String), `inStock` (Boolean, default `true`), `stockQuantity` (Int, default `50`), `isActive` (Boolean, default `true`), `createdAt`, `updatedAt`.
  - Relations: `orderItems` (`OrderItem[]`), `cartItems` (`CartItem[]`), `userPreferences` (`UserProductPreference[]`).
  - Indexes: `@@index([category])`, `@@index([name])`.

- **`Order` (`@@map("orders")`):**
  - `id` (UUID PK), `userId` (FK -> `User.id`), `shippingAddress` (String), `paymentMethod` (String), `totalAmount` (Float), `currency` (String, default `"INR"`), `status` (String, default `"Order Received"`), `paymentStatus` (String, default `"Pending"`), `paypalOrderId` (String?), `paypalCaptureId` (String?), `createdAt`, `updatedAt`.
  - Relations: `user` (`User`), `orderItems` (`OrderItem[]`), `payments` (`Payment[]`), `reservations` (`InventoryReservation[]`).

- **`OrderItem` (`@@map("order_items")`):**
  - `id` (UUID PK), `orderId` (FK -> `Order.id`), `productId` (FK -> `Product.id`), `quantity` (Int), `productName` (String?), `unitPrice` (Float?), `packageSize` (String?), `subtotal` (Float?).

- **`Payment` (`@@map("payments")`):**
  - `id` (UUID PK), `orderId` (FK -> `Order.id`), `provider` (default `"PAYPAL"`), `providerOrderId`, `providerCaptureId`, `amount`, `currency` (default `"USD"`), `originalAmount`, `originalCurrency` (default `"INR"`), `exchangeRate`, `status` (default `"CREATED"`), `paymentMethod`, `rawResponse` (Json?), `createdAt`, `updatedAt`.

---

## 6. Existing Seller-Related APIs

| Method & Path | Auth Middleware | Controller / Handler | Notes |
|---|---|---|---|
| `POST /api/seller/login` | None | `sellerController.loginSeller` | Env-var credentials, returns 7d JWT |
| `GET /api/seller/logout` | None | `sellerController.logoutSeller` | Clears cookie |
| `GET /api/seller/check-auth` | `authSeller` | `sellerController.checkSellerAuth` | Verifies seller JWT |
| `POST /api/seller/add-product` | **Missing `authSeller`** | `sellerProductController.addProductWithImages` | Uploads up to 4 images to Cloudinary |
| `GET /api/seller/products` | **Missing `authSeller`** | `sellerProductController.getAllProductsForSeller` | Lists all products (`createdAt desc`) |
| `PUT /api/seller/update/:id` | **Missing `authSeller`** | `sellerProductController.updateProductDetails` | Calls `productService.updateProduct` |
| `PUT /api/seller/update-order-status/:id` | `authSeller` | `orderController.updateOrderStatus` | Unvalidated status update |
| `GET /api/orders/all` | **Missing `authSeller`** | `orderController.getAllOrdersForSeller` | Lists all orders with `user` & `orderItems` |
| `POST /api/products/add` | `authSeller` | `productController` | Alternate seller product creation |
| `PUT /api/products/:id` | `authSeller` | `productController` | Alternate seller product update |
| `DELETE /api/products/:id` | `authSeller` | `productController` | Alternate seller product delete |

---

## 7. Existing Business Logic That Can Be Reused

1. **`server/services/inventoryService.js`:** `checkStock`, `getAvailableQuantity`, `validateCartInventory`, and `adjustStock` (supports Prisma transactions `tx`) can be reused directly for stock updates and cancellation restocking.
2. **`server/services/productService.js`:** `getAllProducts`, `getProductById`, and `updateProduct` already implement search/filtering and synchronized `stockQuantity` <-> `inStock` updates.
3. **`server/middlewares/authSeller.js` & `server/middlewares/internalAuth.js`:** Existing JWT seller auth and internal microservice API key verification (`x-internal-api-key`) can secure seller AI proxy and internal Express endpoints.
4. **`server/routes/aiProxyRoutes.js`:** Provides the tested Express-to-FastAPI proxy pattern (timeout handling via `AbortController`, `x-internal-api-key` header injection).
5. **`ai-service/app/services/llm_service.py` & `ai-service/app/config.py`:** Already implements configurable `LLM_PROVIDER` (`gemini`, `openai`, `groq`) using LangChain chat models.
6. **`server/prisma/schema.prisma` (`ChatConversation`, `ChatMessage`):** Pattern can be extended or mirrored for persistent Seller AI conversation history and pending action confirmations.

---

## 8. Missing Functionality

1. **Order Lifecycle Enforcement & Cancellation:**
   - No state-machine validation for order status transitions (e.g., preventing `Delivered -> Packing` or arbitrary strings).
   - No `"Cancelled"` status support in seller endpoints/UI, and no automatic inventory restoration on cancellation.
   - No seller-facing order analytics/attention queries (e.g., today's orders, delayed orders, status counts, order detail by ID).
2. **Inventory Intelligence & Thresholds:**
   - No `lowStockThreshold` (or configurable seller threshold) in `Product` schema or seller settings.
   - No deterministic restocking recommendation engine (`Reorder Point = Average Daily Sales × Supplier Lead Time + Safety Stock`, `Suggested Reorder Quantity = Target Stock Level - Available Stock`).
   - No product velocity/performance analysis (fast-selling, slow-moving, declining/increasing demand).
   - `ManageStock.jsx` and `Orders.jsx` have `_id` vs `id` mismatches and missing `stockQuantity` editing.
3. **Sales & Business Analytics:**
   - No backend aggregation endpoints for today's/weekly/monthly revenue, completed orders count, AOV, top 5 / least selling products, category revenue/popularity, or order status distribution.
4. **Seller AI Agent, MCP Server & Confirmation Workflow:**
   - No MCP server/tools exposing seller read & write operations (`get_orders`, `get_order_details`, `update_order_status`, `get_inventory`, `get_low_stock`, `update_product_stock`, `get_sales_analytics`, `get_restock_recommendations`).
   - No LangGraph seller agent workflow with human-in-the-loop confirmation tokens/pending actions before mutating order status or stock.
   - No Seller AI Assistant UI tab/drawer in `client/src/pages/Seller.jsx`.
   - Security gaps on `sellerRoutes.js` and `orders.js` (`authSeller` missing on 4 seller endpoints).

---

## 9. Proposed Integration Architecture

```
[Seller Browser UI]
   │  (Seller JWT in Authorization header via sellerAxios)
   ▼
[Express 5 Backend :10000]  ──►  [PostgreSQL via Prisma ORM]
   │  1. Verifies Seller JWT (authSeller)
   │  2. Proxies /api/seller/ai/* ──(x-internal-api-key + seller context)──►
   ▼
[Python FastAPI + LangGraph AI Service :8005 (ai-service/)]
   │  1. Seller LangGraph Agent (Intent -> Tool Selection -> Response / Confirmation Card)
   │  2. Configurable LLM (Gemini / OpenAI / Groq via llm_service.py)
   │  3. MCP Client ◄──(MCP Protocol)──► [Seller MCP Tool Server]
   │                                           │
   │                                           ▼  (x-internal-api-key)
   └─────────────────────────◄── [Express Internal Seller APIs /api/internal/seller/*]
```

**Key Architectural Guarantees:**
- **Primary Backend Ownership:** Express + Prisma + PostgreSQL remains the sole source of truth and database owner. No second database is created.
- **Confirmed Mutations Only:** Write tools (`update_order_status`, `update_product_stock`) operate in a two-step **Prepare -> Confirm -> Execute** flow. The agent returns a structured pending-action payload (current vs. proposed state + action ID); execution only runs after explicit seller confirmation.
- **Payment Integrity:** Seller AI tools can read `paymentStatus` and `paymentMethod` but are strictly prohibited from modifying `paymentStatus`.
- **Auth Hardening:** Attach `authSeller` to all unprotected seller routes in `sellerRoutes.js` and `orders.js`, and switch `ManageStock.jsx` to `sellerAxios`.

---

## 10. Files That Need to Be Created or Modified

### Backend (`server/`)
- **Modify:**
  - `server/prisma/schema.prisma` — Add `lowStockThreshold Int @default(10)` (and optional `safetyStock`, `leadTimeDays`) to `Product`; add `SellerAiConversation` / `SellerAiMessage` / `SellerPendingAction` (or equivalent) for chat history & confirmation state.
  - `server/routes/sellerRoutes.js` — Add `authSeller` to `/add-product`, `/products`, `/update/:id`.
  - `server/routes/orders.js` — Add `authSeller` to `GET /all`.
  - `server/controllers/orderController.js` — Enforce valid order status transitions, support `"Cancelled"` with `adjustStock` restoration inside a transaction, and normalize `id`/`_id`.
  - `server/server.js` — Mount `/api/seller/ai` and `/api/internal/seller` routes.
- **Create:**
  - `server/services/orderLifecycleService.js` — Allowed status transition map (`Order Received -> Packing -> Out for Delivery -> Delivered`, plus valid `Cancelled` transitions) and transactional update/restock logic.
  - `server/services/sellerAnalyticsService.js` — Deterministic PostgreSQL/Prisma aggregations for revenue (daily/weekly/monthly), AOV, top/least selling products, category breakdown, order status distribution, and restocking recommendations.
  - `server/routes/internalSellerRoutes.js` — `internalAuth`-protected endpoints consumed by the MCP server/AI service for seller orders, inventory, analytics, and validated mutations.
  - `server/routes/sellerAiProxyRoutes.js` — `authSeller`-protected endpoints (`/chat`, `/confirm`, `/conversations`) proxying to FastAPI.

### AI Service (`ai-service/`)
- **Modify:**
  - `ai-service/requirements.txt` — Add `mcp>=1.0.0` (and `langchain-mcp-adapters` if used).
  - `ai-service/app/main.py` — Register seller AI router (`/api/ai/seller/*`).
  - `ai-service/app/config.py` — Add any seller-agent config defaults if needed.
- **Create:**
  - `ai-service/app/mcp/seller_mcp_server.py` — MCP server exposing typed seller-management tools (orders, inventory, analytics, restock recommendations, prepare/execute status & stock updates) backed by Express internal APIs.
  - `ai-service/app/agents/seller/` (`state.py`, `graph.py`, `nodes.py`) — LangGraph seller assistant with tool-calling, deterministic formatting, ambiguity resolution, and confirmation gating.
  - `ai-service/app/api/routes/seller_chat.py` — FastAPI endpoints for seller chat and action confirmation.

### Frontend (`client/`)
- **Modify:**
  - `client/src/pages/Seller.jsx` — Add `"AI Assistant"` tab (`SellerAiAssistant`).
  - `client/src/components/Seller/ManageStock.jsx` — Fix `_id` -> `id`, switch to `sellerAxios`, expose `stockQuantity` and `lowStockThreshold` editing.
  - `client/src/components/Seller/Orders.jsx` — Fix `_id` -> `id` fallback, add `"Cancelled"` status option respecting lifecycle rules.
- **Create:**
  - `client/src/components/Seller/SellerAiAssistant.jsx` — Natural-language chat interface with quick prompts, structured order/inventory/analytics cards, and interactive Confirm/Cancel action cards.
  - `client/src/services/sellerAiService.js` — `sellerAxios` API wrapper for `/seller/ai/*`.

