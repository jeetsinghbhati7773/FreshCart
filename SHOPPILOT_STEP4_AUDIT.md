# ShopPilot – Step 4: PayPal Integration & End-to-End Payment Processing Audit

## 1. Existing Payment Architecture

### Current Status
- **Razorpay:** Implemented in `server/controllers/paymentController.js` and `client/src/pages/Cart.jsx`. Creates Razorpay order in INR via `POST /api/payment/razorpay`, invokes client-side checkout popup, and completes order logging upon handler callback.
- **Cash on Delivery (COD):** Handled directly in `client/src/pages/Cart.jsx` and `server/controllers/orderController.js` with direct order creation.
- **Stripe:** Package `stripe` (v18.2.1) installed in `server/package.json`, but no active routes or controllers currently implemented.
- **PayPal:** Not yet integrated.

### Existing Deficiencies in Payment Architecture
1. **No Dedicated Payment Ledger Model:** Orders currently track only `paymentMethod` as a string (e.g. `"COD"` or `"Online"`). There is no standalone `Payment` table to record transaction references (`providerOrderId`, `providerCaptureId`), payment provider, raw provider callbacks, or capture timestamps.
2. **Missing Historical Price Snapshot:** `OrderItem` in `schema.prisma` currently records only `orderId`, `productId`, and `quantity`. If a product's price or name changes in PostgreSQL, past order records cannot accurately reconstruct historical item prices or package sizes.
3. **Frontend-Driven Status Signaling:** The existing Razorpay implementation creates the database `Order` only *after* the browser handler receives the payment response. If a user closes the tab before the callback completes, payment is captured without an order being created in PostgreSQL.
4. **Lack of Server-to-Server Webhook Verification:** Neither Razorpay nor Stripe currently verifies cryptographically signed webhooks in the backend.

---

## 2. Existing Order Lifecycle

### Current Order Flow
```
User clicks "Place Order" in Cart.jsx
   ├── COD ──► POST /api/orders (status: "Order Received", inventory decremented)
   └── Online (Razorpay) ──► POST /api/payment/razorpay ──► Razorpay Popup ──► Handler calls POST /api/orders
```

### Existing Order Statuses
- `"Order Received"` (initial status)
- `"Packing"`
- `"Out for Delivery"`
- `"Delivered"`

### Target Step 4 Order Lifecycle with PayPal
```
1. Customer accepts ShopPilot Optimized Cart in Frontend
2. Backend validates Cart, Prices & Inventory in PostgreSQL
3. Backend atomically reserves inventory & creates Order (status: "PENDING_PAYMENT")
4. Backend generates PayPal Order v2 via PayPal Sandbox API (intent: "CAPTURE")
5. Customer explicitly approves payment on PayPal Sandbox modal
6. Backend captures payment via PayPal Orders v2 Capture API (with Idempotency-Key)
7. Backend verifies capture status == "COMPLETED"
8. Backend marks Payment as "COMPLETED" and Order as "CONFIRMED"
9. Backend consumes inventory reservation (or releases it if cancelled/expired)
10. PayPal Webhook (PAYMENT.CAPTURE.COMPLETED) performs asynchronous signature-verified reconciliation
```

---

## 3. Existing Cart Architecture

- **Models:** `Cart` (`userId`, `sessionId`, `createdAt`, `updatedAt`) and `CartItem` (`cartId`, `productId`, `quantity`).
- **Services:** `server/services/cartService.js` provides `getOrCreateCart`, `getCart`, `addItemToCart`, `updateCartItemQuantity`, `removeCartItem`, `clearCartItems`, and format calculations (subtotal, MRP total, 5% GST, savings).
- **Step 3 Integration:** `POST /api/cart/batch-add` was added in Step 3, enabling 1-click transfer of AI-proposed grocery items directly into the customer's cart.
- **Price Authority:** Express / PostgreSQL is the single source of truth for cart pricing. Any frontend totals are re-calculated and verified server-side.

---

## 4. Existing Inventory Management

- **Fields:** `Product.stockQuantity` (Int, default 50) and `Product.inStock` (Boolean, default true).
- **Service:** `server/services/inventoryService.js` provides:
  - `checkStock(productId)`: Returns available quantity, inStock flag, active status.
  - `validateCartInventory(items)`: Validates availability for multiple items.
  - `adjustStock(productId, delta, client)`: Modifies `stockQuantity` atomically within a Prisma transaction.
- **Requirement for Step 4:** Implement an explicit **Inventory Reservation** mechanism (`InventoryReservation` table) with auto-expiry (e.g. 15 minutes) to prevent overselling between order creation and payment capture.

---

## 5. Currency & Indian Market Compatibility (PayPal Sandbox)

### The Currency Challenge
- FreshCart product catalog uses Indian Rupees (`INR`).
- **PayPal Sandbox Policy:** PayPal REST Orders v2 API restricts `INR` transactions to domestic Indian merchants with RBI-compliant bilateral merchant agreements. In PayPal Sandbox, sending `INR` typically produces an API error (`CURRENCY_NOT_ALLOWED` or `TRANSACTION_REFUSED`).
- Supported global Sandbox currencies include `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `SGD`, `JPY`, etc.

### Architectural Solution: Transparent Currency Conversion Layer
1. **Explicit Currency Config:** Maintain `PAYPAL_CURRENCY=USD` in configuration with fallback conversion service (`currencyService.js`).
2. **Transparent Customer Conversion:**
   - Display original grocery total in INR (e.g. `₹1,250.00`).
   - Display converted PayPal charge amount in USD (e.g. `$14.45 USD` @ `86.50 INR/USD`).
   - Store both `originalAmount` (`INR`) and `capturedAmount` (`USD`) in the `Payment` ledger.
   - Do NOT silently send INR numbers as USD.
   - Re-calculate and lock the exchange rate when the PayPal order is initiated.

---

## 6. Required Database Changes

We extend `server/prisma/schema.prisma` without breaking existing tables or dropping data:

1. **`Payment` Model (New Table):**
   - `id`: UUID Primary Key
   - `orderId`: Foreign key to `Order`
   - `provider`: String (e.g. `"PAYPAL"`, `"RAZORPAY"`, `"COD"`)
   - `providerOrderId`: String? (PayPal order ID)
   - `providerCaptureId`: String? (PayPal capture ID)
   - `amount`: Float (Captured amount in PayPal currency)
   - `currency`: String (e.g. `"USD"`)
   - `originalAmount`: Float? (INR amount)
   - `originalCurrency`: String? (e.g. `"INR"`)
   - `exchangeRate`: Float?
   - `status`: String (Default: `"CREATED"`, transitions to `"PAYER_APPROVED"`, `"CAPTURE_PENDING"`, `"COMPLETED"`, `"FAILED"`, `"CANCELLED"`)
   - `paymentMethod`: String?
   - `rawResponse`: Json?
   - `createdAt`, `updatedAt`

2. **`InventoryReservation` Model (New Table):**
   - `id`: UUID Primary Key
   - `orderId`: String
   - `productId`: String
   - `reservedQuantity`: Int
   - `status`: String (Default: `"RESERVED"`, transitions to `"CONSUMED"`, `"RELEASED"`, `"EXPIRED"`)
   - `expiresAt`: DateTime
   - `createdAt`, `updatedAt`

3. **`WebhookEvent` Model (New Table):**
   - `id`: UUID Primary Key
   - `provider`: String (Default: `"PAYPAL"`)
   - `eventId`: String (PayPal event ID)
   - `eventType`: String
   - `resourceId`: String?
   - `processingStatus`: String (Default: `"PENDING"`, transitions to `"PROCESSED"`, `"FAILED"`, `"IGNORED"`)
   - `payload`: Json
   - `errorMessage`: String?
   - `receivedAt`: DateTime (Default: now)
   - `processedAt`: DateTime?
   - `@@unique([provider, eventId])`

4. **Enhance `Order` & `OrderItem` Models:**
   - `Order`: add `currency` (String, default "INR"), `paymentStatus` (String, default "PENDING"), `paypalOrderId` (String?), `paypalCaptureId` (String?), and relation to `payments` & `reservations`.
   - `OrderItem`: add `productName` (String?), `unitPrice` (Float?), `packageSize` (String?), `subtotal` (Float?) for immutable historical snapshots.

---

## 7. PayPal Server-Side Service Architecture

Create modular services under `server/services/paypal/`:
- **`paypalClient.js`:** Base HTTP client managing Sandbox base URL (`https://api-m.sandbox.paypal.com`), request timeouts, and headers.
- **`paypalAuth.js`:** OAuth 2.0 access token retrieval (`POST /v1/oauth2/token`) with in-memory caching and token expiry tracking.
- **`paypalOrderService.js`:** Orders v2 order creation (`POST /v2/checkout/orders`) with idempotency headers (`PayPal-Request-Id`) and order lookup (`GET /v2/checkout/orders/{id}`).
- **`paypalCaptureService.js`:** Captures approved orders (`POST /v2/checkout/orders/{id}/capture`) with retry and error mapping (`INSTRUMENT_DECLINED`, `ORDER_ALREADY_CAPTURED`).
- **`paypalWebhookService.js`:** Validates webhook transmission signatures via PayPal's `POST /v1/notifications/verify-webhook-signature` API, logs events in `WebhookEvent`, and prevents duplicate event processing.
- **`currencyService.js`:** Centralized exchange rate converter (INR $\leftrightarrow$ USD) with transparent conversion metadata.
- **`reservationService.js`:** Manages atomic stock reservations, reservation expiry checks, and stock releases.

---

## 8. Frontend PayPal Integration Architecture

- **SDK Loading:** Dynamic, robust script loader for official PayPal JavaScript SDK (SDK v6 / `https://www.paypal.com/sdk/js`) configured with Sandbox Client ID, currency (`USD`), and intent (`capture`).
- **Components:**
  - `client/src/components/payment/PayPalButton.jsx`: Official PayPal Smart Buttons rendering `createOrder` (delegating to Express) and `onApprove` (delegating to Express capture).
  - `client/src/components/payment/PaymentSummary.jsx`: Transparent dual-currency breakdown (Total in INR, Exchange Rate, PayPal Charge in USD).
  - `client/src/pages/Cart.jsx`: Integrated PayPal payment option alongside COD and Razorpay.
  - `client/src/pages/PaymentSuccess.jsx`: Verified order confirmation page displaying order ID, PayPal capture ID, amount, and item summary.
  - `client/src/pages/PaymentCancelled.jsx`: Friendly cancellation feedback with return-to-cart link.
- **Security Rule:** The frontend NEVER touches PayPal client secrets, access tokens, or performs capture REST calls directly.

---

## 9. Required Environment Variables

### Server (`server/.env` & `server/.env.example`)
```env
# PayPal Sandbox Configuration
PAYPAL_ENVIRONMENT=SANDBOX
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret_here
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here
PAYPAL_CURRENCY=USD
EXCHANGE_RATE_INR_TO_USD=0.0116
```

### Client (`client/.env`)
```env
VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id_here
VITE_PAYPAL_CURRENCY=USD
```

---

## 10. Security & Idempotency Considerations

1. **Client Secret Privacy:** The PayPal Client Secret is strictly stored on the server and never sent to React or committed to Git.
2. **Server-Side Price Recalculation:** The payment amount is ALWAYS calculated server-side from PostgreSQL `offerPrice` and verified inventory. Client-provided totals are never trusted.
3. **Idempotency Keys:**
   - Express sends `PayPal-Request-Id: <unique-order-uuid>` to PayPal Orders API to prevent double-charging on network retries.
   - Database order creation uses Prisma transactions to prevent duplicate local orders.
4. **Capture State Integrity:** Local orders are marked `CONFIRMED` only when PayPal returns capture status `COMPLETED`.
5. **Webhook Signature Verification:** Every incoming webhook is verified against PayPal's verification endpoint before any database state transition occurs.
6. **Replay & Concurrency Protection:** Webhook events are deduplicated via unique constraint `(provider, eventId)`.

---

## 11. Files to Create and Modify

### New Files
- `server/services/currencyService.js`
- `server/services/reservationService.js`
- `server/services/paypal/paypalClient.js`
- `server/services/paypal/paypalAuth.js`
- `server/services/paypal/paypalOrderService.js`
- `server/services/paypal/paypalCaptureService.js`
- `server/services/paypal/paypalWebhookService.js`
- `server/controllers/paypalController.js`
- `server/routes/paypalRoutes.js`
- `server/routes/webhookRoutes.js`
- `client/src/services/paypalService.js`
- `client/src/components/payment/PayPalButton.jsx`
- `client/src/components/payment/PaymentSummary.jsx`
- `client/src/pages/PaymentSuccess.jsx`
- `client/src/pages/PaymentCancelled.jsx`
- `server/test/step4Verify.js`
- `SHOPPILOT_STEP4_IMPLEMENTATION.md`

### Modified Files
- `server/prisma/schema.prisma` (Add `Payment`, `InventoryReservation`, `WebhookEvent` models; update `Order` & `OrderItem`)
- `server/server.js` (Mount PayPal routes and webhook parser with rawBody support)
- `server/routes/paymentRoutes.js` (Include PayPal routes)
- `client/src/pages/Cart.jsx` (Add PayPal payment option and button rendering)
- `client/src/pages/MyOrders.jsx` (Display PayPal transaction ID, capture reference, and payment status)
- `client/src/App.jsx` (Add routes for `/payment-success` and `/payment-cancelled`)
- `README.md` (Update Step 4 capabilities)

---

## 12. Implementation Plan

- **Phase 1: Audit** (Complete - `SHOPPILOT_STEP4_AUDIT.md`)
- **Phase 2: Database Schema & Migration** (Add `Payment`, `InventoryReservation`, `WebhookEvent`, push schema, run `prisma generate`)
- **Phase 3: Currency & Inventory Reservation Services** (Implement `currencyService.js` and `reservationService.js`)
- **Phase 4: PayPal Backend Integration** (Implement auth, orders, capture, and webhook verification)
- **Phase 5: Express Routes & Controllers** (Wire `POST /create-order`, `POST /capture-order`, `POST /webhooks/paypal`)
- **Phase 6: Frontend PayPal Checkout Experience** (PayPal Smart Buttons in `Cart.jsx`, success & cancel pages, order history badge)
- **Phase 7: Automated Verification & Testing** (Create and run `server/test/step4Verify.js` testing cart validation, order creation, capture, and webhooks)
- **Phase 8: Documentation & Git Commit** (Deliver `SHOPPILOT_STEP4_IMPLEMENTATION.md` and push to GitHub)

