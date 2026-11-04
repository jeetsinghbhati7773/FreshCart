import express from "express";

const router = express.Router();

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "ShopPilot Shopping Foundation API",
    version: "1.0.0",
    description: "API for ShopPilot — autonomous AI-powered grocery shopping platform. Provides product catalog browsing, multi-criteria filtering, inventory validation, and authoritative cart management.",
  },
  servers: [
    {
      url: "http://localhost:10000",
      description: "Local development server",
    },
  ],
  paths: {
    "/api/products": {
      get: {
        summary: "List all active grocery products",
        description: "Returns paginated products matching search query, category, price range, brand, and sorting parameters.",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Full-text search in product name and description" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category (Vegetables, Fruits, Drinks, Dairy, Grains, Snacks, Instant, Bakery)" },
          { name: "minPrice", in: "query", schema: { type: "number" }, description: "Minimum offer price in INR" },
          { name: "maxPrice", in: "query", schema: { type: "number" }, description: "Maximum offer price in INR" },
          { name: "brand", in: "query", schema: { type: "string" }, description: "Filter by brand name" },
          { name: "inStockOnly", in: "query", schema: { type: "boolean" }, description: "Filter items strictly in stock" },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["newest", "price-asc", "price-desc", "name-asc", "name-desc"] }, description: "Sort criteria" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 24 } },
        ],
        responses: {
          200: { description: "Successful product listing response" },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        summary: "Get product details by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Detailed product object" },
          404: { description: "Product not found" },
        },
      },
    },
    "/api/categories": {
      get: {
        summary: "Get all product categories",
        description: "Returns distinct categories with product counts and representative image thumbnails.",
        responses: {
          200: { description: "Category list" },
        },
      },
    },
    "/api/categories/{name}/products": {
      get: {
        summary: "Get products belonging to a category",
        parameters: [
          { name: "name", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Category products list" },
        },
      },
    },
    "/api/cart": {
      get: {
        summary: "Retrieve current cart",
        description: "Retrieves the authenticated user or session cart with authoritative PostgreSQL pricing, GST (5%), discount savings, and item availability.",
        parameters: [
          { name: "x-session-id", in: "header", schema: { type: "string" }, description: "Guest session identifier" },
        ],
        responses: {
          200: { description: "Authoritative cart calculation object" },
        },
      },
      delete: {
        summary: "Clear all items from cart",
        responses: {
          200: { description: "Cart cleared" },
        },
      },
    },
    "/api/cart/items": {
      post: {
        summary: "Add item to cart",
        description: "Adds an item or increments its quantity, validating current stock.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId"],
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "integer", default: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Item added, returns updated cart" },
          400: { description: "Insufficient stock or invalid input" },
        },
      },
    },
    "/api/cart/items/{productId}": {
      put: {
        summary: "Update item quantity in cart",
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  quantity: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cart item updated" },
          400: { description: "Insufficient stock or invalid quantity" },
        },
      },
      delete: {
        summary: "Remove item from cart",
        parameters: [
          { name: "productId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Item removed from cart" },
        },
      },
    },
    "/api/cart/validate": {
      post: {
        summary: "Pre-checkout inventory and price validation",
        description: "Verifies that all items in cart are in stock, active, and priced accurately prior to order placement.",
        responses: {
          200: { description: "Validation outcome" },
        },
      },
    },
    "/api/orders": {
      post: {
        summary: "Create a new order",
        description: "Validates inventory, places order, decrements stock atomically, and clears user cart.",
        responses: {
          201: { description: "Order created successfully" },
          400: { description: "Validation failed or insufficient stock" },
        },
      },
    },
  },
};

// Serve OpenAPI JSON
router.get("/openapi.json", (req, res) => {
  res.json(openApiSpec);
});

// Serve interactive Swagger UI HTML via CDN
router.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ShopPilot API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { background-color: #1b5e20 !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`);
});

export default router;
