import axios from "axios";

const BASE_URL = "http://localhost:10000";
const results = [];

function record(testName, passed, details = "") {
  results.push({ testName, passed, details });
  console.log(`${passed ? "✅ PASS" : "❌ FAIL"}: ${testName} ${details ? `(${details})` : ""}`);
}

async function runTests() {
  console.log("=================================================");
  console.log("🧪 SHOPPILOT STEP 1 — AUTOMATED VERIFICATION SUITE");
  console.log("=================================================\n");

  // 1. Categories API
  try {
    const res = await axios.get(`${BASE_URL}/api/categories`);
    const count = res.data?.categories?.length || 0;
    const totalItems = res.data?.categories?.reduce((acc, c) => acc + c.count, 0) || 0;
    record("Categories API (/api/categories)", count === 8 && totalItems === 231, `Found ${count} categories with ${totalItems} products`);
  } catch (e) {
    record("Categories API (/api/categories)", false, e.message);
  }

  // 2. Product Listing & Count
  let firstProductId = null;
  try {
    const res = await axios.get(`${BASE_URL}/api/products`);
    const count = res.data?.products?.length || 0;
    firstProductId = res.data?.products?.[0]?.id;
    record("All Products Listing (/api/products)", count === 231, `Returned ${count} products`);
  } catch (e) {
    record("All Products Listing (/api/products)", false, e.message);
  }

  // 3. Product Search
  try {
    const res = await axios.get(`${BASE_URL}/api/products?search=Maggi`);
    const count = res.data?.products?.length || 0;
    const allMatch = res.data?.products?.every((p) => p.name.toLowerCase().includes("maggi") || p.brand?.toLowerCase() === "maggi");
    record("Product Search (?search=Maggi)", count > 0 && allMatch, `Found ${count} matching products`);
  } catch (e) {
    record("Product Search (?search=Maggi)", false, e.message);
  }

  // 4. Category Filtering
  try {
    const res = await axios.get(`${BASE_URL}/api/products?category=Dairy`);
    const count = res.data?.products?.length || 0;
    const allDairy = res.data?.products?.every((p) => p.category === "Dairy");
    record("Category Filtering (?category=Dairy)", count === 22 && allDairy, `Found ${count} dairy items`);
  } catch (e) {
    record("Category Filtering (?category=Dairy)", false, e.message);
  }

  // 5. Price Range Filtering
  try {
    const res = await axios.get(`${BASE_URL}/api/products?minPrice=50&maxPrice=100`);
    const count = res.data?.products?.length || 0;
    const inRange = res.data?.products?.every((p) => p.offerPrice >= 50 && p.offerPrice <= 100);
    record("Price Range Filtering (?minPrice=50&maxPrice=100)", count > 0 && inRange, `Found ${count} products in range ₹50-₹100`);
  } catch (e) {
    record("Price Range Filtering", false, e.message);
  }

  // 6. Product Details API
  try {
    if (firstProductId) {
      const res = await axios.get(`${BASE_URL}/api/products/${firstProductId}`);
      const valid = res.data?.id === firstProductId && res.data?.name && res.data?.offerPrice;
      record("Product Details (/api/products/:id)", Boolean(valid), `Fetched "${res.data.name}"`);
    } else {
      record("Product Details (/api/products/:id)", false, "No product ID available");
    }
  } catch (e) {
    record("Product Details (/api/products/:id)", false, e.message);
  }

  // 7. Cart Lifecycle (Create -> Add -> Update -> Totals -> Clear)
  const testSessionId = "test-ai-agent-session-" + Date.now();
  const cartHeaders = { "x-session-id": testSessionId };

  try {
    // 7.1 Empty Cart
    const emptyRes = await axios.get(`${BASE_URL}/api/cart`, { headers: cartHeaders });
    const emptyValid = emptyRes.data?.success && emptyRes.data.cart.itemCount === 0;
    record("Cart Retrieval - Empty (/api/cart)", emptyValid, "Zero initial items");

    // 7.2 Add Item
    const addRes = await axios.post(
      `${BASE_URL}/api/cart/items`,
      { productId: firstProductId, quantity: 2 },
      { headers: cartHeaders }
    );
    const addedValid = addRes.data?.cart?.itemCount === 2;
    const subtotal = addRes.data?.cart?.subtotal;
    const expectedGst = Math.round(subtotal * 0.05);
    const gstValid = addRes.data?.cart?.gst === expectedGst;
    record("Add Item to Cart (/api/cart/items)", addedValid && gstValid, `Added 2 qty; Subtotal: ₹${subtotal}, GST: ₹${addRes.data?.cart?.gst}`);

    // 7.3 Update Quantity
    const updateRes = await axios.put(
      `${BASE_URL}/api/cart/items/${firstProductId}`,
      { quantity: 4 },
      { headers: cartHeaders }
    );
    const updatedValid = updateRes.data?.cart?.itemCount === 4;
    record("Update Cart Item Quantity", updatedValid, `Updated to 4 units; Total: ₹${updateRes.data?.cart?.totalAmount}`);

    // 7.4 Cart Inventory Validation
    const valRes = await axios.post(`${BASE_URL}/api/cart/validate`, {}, { headers: cartHeaders });
    record("Cart Pre-Checkout Validation", valRes.data?.isValid === true, "Inventory & pricing verified");

    // 7.5 Remove Item
    const removeRes = await axios.delete(`${BASE_URL}/api/cart/items/${firstProductId}`, { headers: cartHeaders });
    const removeValid = removeRes.data?.cart?.itemCount === 0;
    record("Remove Item from Cart", removeValid, "Item removed cleanly");
  } catch (e) {
    record("Cart Lifecycle Tests", false, e.response?.data?.message || e.message);
  }

  // 8. OpenAPI Documentation Endpoint
  try {
    const res = await axios.get(`${BASE_URL}/api/docs/openapi.json`);
    const valid = res.data?.openapi === "3.0.0" && res.data?.info?.title?.includes("ShopPilot");
    record("OpenAPI 3.0 Documentation (/api/docs/openapi.json)", valid, res.data?.info?.title);
  } catch (e) {
    record("OpenAPI 3.0 Documentation", false, e.message);
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  console.log("\n=================================================");
  console.log(`📊 TEST RESULTS: ${passedCount} / ${results.length} PASSED (${Math.round((passedCount / results.length) * 100)}%)`);
  console.log("=================================================");

  if (passedCount === results.length) {
    console.log("🎉 ALL STEP 1 TESTS COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
