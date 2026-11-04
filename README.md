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

### 1. Backend Setup
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

### 2. Frontend Setup
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
- [x] Vite production build (`npx vite build` — built cleanly in 13.8s)

---

## 🔒 Security
- Database credentials and secrets are kept strictly in `.env` and excluded via `.gitignore`.
- Template configuration available in `server/.env.example`.
