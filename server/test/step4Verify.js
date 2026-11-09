import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { CurrencyService } from "../services/currencyService.js";
import { ReservationService } from "../services/reservationService.js";
import { PayPalWebhookService } from "../services/paypal/paypalWebhookService.js";

const BASE_URL = "http://localhost:10000";

async function runStep4Verification() {
  console.log("==================================================");
  console.log("   ShopPilot Step 4: PayPal End-to-End Test Suite   ");
  console.log("==================================================\n");

  let testUser = null;
  let testProduct = null;
  let testOrderId = null;
  let jwtToken = null;

  try {
    // -------------------------------------------------------------
    // Test 1: Currency Conversion Service
    // -------------------------------------------------------------
    console.log("▶ [Test 1/5] Testing CurrencyService...");
    const inrAmount = 2500;
    const conversion = CurrencyService.convertInrToPayPalCurrency(inrAmount, "USD");
    console.log("  Conversion:", `${inrAmount} INR -> $${conversion.convertedAmount} ${conversion.targetCurrency} (Rate: ${conversion.exchangeRate})`);
    
    if (conversion.convertedAmount <= 0 || conversion.targetCurrency !== "USD") {
      throw new Error("Currency conversion returned invalid result.");
    }
    console.log("  ✔ CurrencyService passed.\n");

    // -------------------------------------------------------------
    // Setup Test Data
    // -------------------------------------------------------------
    console.log("▶ Setting up test user and product in PostgreSQL...");
    const email = `test_paypal_${Date.now()}@example.com`;
    testUser = await prisma.user.create({
      data: {
        name: "PayPal Sandbox Tester",
        email,
        password: "hashed_dummy_password",
      },
    });

    jwtToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || "freshcart_secret_key_2026"
    );

    // Get an existing active product or create one
    testProduct = await prisma.product.findFirst({
      where: { isActive: true, inStock: true, stockQuantity: { gte: 10 } },
    });

    if (!testProduct) {
      testProduct = await prisma.product.create({
        data: {
          name: "Test Organic Whole Wheat Atta 5kg",
          offerPrice: 220,
          price: 250,
          category: "Grains",
          stockQuantity: 50,
          inStock: true,
          isActive: true,
        },
      });
    }

    console.log(`  User: ${testUser.name} (${testUser.id})`);
    console.log(`  Product: ${testProduct.name} (Stock: ${testProduct.stockQuantity}, Price: ₹${testProduct.offerPrice})\n`);

    // -------------------------------------------------------------
    // Test 2: Inventory Reservation Service
    // -------------------------------------------------------------
    console.log("▶ [Test 2/5] Testing ReservationService atomic stock holds...");
    const initialStock = testProduct.stockQuantity;
    const reserveQty = 2;

    // Create temporary dummy order to hold reservation
    const dummyOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        shippingAddress: "221B Baker St, London/Delhi",
        paymentMethod: "PAYPAL",
        totalAmount: testProduct.offerPrice * reserveQty,
        paymentStatus: "Pending",
      },
    });

    const reservations = await ReservationService.reserveInventory(
      dummyOrder.id,
      [{ productId: testProduct.id, quantity: reserveQty }],
      15
    );
    console.log(`  Reserved ${reserveQty} units. Reservation record ID: ${reservations[0].id}`);

    // Verify product stock was decremented
    const productAfterHold = await prisma.product.findUnique({ where: { id: testProduct.id } });
    console.log(`  Stock after hold: ${productAfterHold.stockQuantity} (Expected: ${initialStock - reserveQty})`);
    if (productAfterHold.stockQuantity !== initialStock - reserveQty) {
      throw new Error("Stock was not decremented accurately during reservation!");
    }

    // Release reservations and verify stock restoration
    const releasedCount = await ReservationService.releaseReservations(dummyOrder.id, "RELEASED");
    const productAfterRelease = await prisma.product.findUnique({ where: { id: testProduct.id } });
    console.log(`  Released ${releasedCount} reservation(s). Restored stock: ${productAfterRelease.stockQuantity}`);
    if (productAfterRelease.stockQuantity !== initialStock) {
      throw new Error("Stock was not restored accurately during reservation release!");
    }

    await prisma.order.delete({ where: { id: dummyOrder.id } });
    console.log("  ✔ ReservationService passed.\n");

    // -------------------------------------------------------------
    // Test 3: Public PayPal Config API
    // -------------------------------------------------------------
    console.log("▶ [Test 3/5] Testing GET /api/payments/paypal/config...");
    const configRes = await fetch(`${BASE_URL}/api/payments/paypal/config`);
    const configData = await configRes.json();
    console.log("  Config received:", JSON.stringify(configData));
    if (!configData.success || !configData.clientId || !configData.currency) {
      throw new Error("Invalid config response from server.");
    }
    console.log("  ✔ Public config endpoint passed.\n");

    // -------------------------------------------------------------
    // Test 4: Create & Capture PayPal Order Flow via HTTP Endpoints
    // -------------------------------------------------------------
    console.log("▶ [Test 4/5] Testing POST /api/payments/paypal/create-order & capture...");
    const orderItems = [{ productId: testProduct.id, quantity: 2 }];

    const createRes = await fetch(`${BASE_URL}/api/payments/paypal/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        shippingAddress: "Flat 402, Sunshine Apartments, Bangalore, Karnataka 560001",
        items: orderItems,
      }),
    });

    const createData = await createRes.json();
    console.log("  Create Order Status:", createRes.status, createData.success ? "SUCCESS" : createData.message);

    if (!createData.success || !createData.orderId) {
      throw new Error(`Create order failed: ${JSON.stringify(createData)}`);
    }

    testOrderId = createData.orderId;
    console.log(`  Created Local Order ID: ${testOrderId}`);
    console.log(`  PayPal Order ID: ${createData.paypalOrderId}`);
    console.log(`  Authoritative INR Total: ₹${createData.authoritativeTotalInr}`);
    console.log(`  Target USD Amount: $${createData.currencyMeta.convertedAmount} (Rate: ${createData.currencyMeta.exchangeRate})`);

    // Verify local database records exist
    const dbOrder = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { orderItems: true, payments: true, reservations: true },
    });
    console.log(`  DB Order Status: "${dbOrder.status}", Payment: "${dbOrder.paymentStatus}"`);
    console.log(`  Active Reservations: ${dbOrder.reservations.length}`);
    console.log(`  Payment record created: ${dbOrder.payments.length > 0}`);

    if (dbOrder.paymentStatus !== "Pending" || dbOrder.reservations.length === 0) {
      throw new Error("Local order and reservations not properly persisted!");
    }

    // Now test Capture (or reconciliation)
    console.log("\n  Simulating Customer Approval & Capture reconciliation...");
    const simulatedCaptureId = `CAP-TEST-${Date.now()}`;

    // Execute capture directly via Prisma transaction (mirroring capture controller logic)
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: testOrderId },
        data: {
          paymentStatus: "Paid",
          paypalCaptureId: simulatedCaptureId,
          status: "Order Placed",
        },
      });

      await tx.payment.updateMany({
        where: { orderId: testOrderId },
        data: {
          providerCaptureId: simulatedCaptureId,
          status: "COMPLETED",
        },
      });

      await ReservationService.consumeReservations(testOrderId, tx);
    });

    // Verify order status endpoint
    const statusRes = await fetch(`${BASE_URL}/api/payments/paypal/status/${testOrderId}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    const statusData = await statusRes.json();
    console.log(`  Order Status Endpoint -> Payment: "${statusData.order.paymentStatus}", Status: "${statusData.order.status}"`);
    console.log(`  Reservations Status: "${statusData.order.reservations[0]?.status}" (Expected: CONSUMED)`);

    if (statusData.order.paymentStatus !== "Paid" || statusData.order.reservations[0]?.status !== "CONSUMED") {
      throw new Error("Order reconciliation failed: not marked as Paid or reservations not CONSUMED.");
    }

    console.log("  ✔ Create & Capture lifecycle passed.\n");

    // -------------------------------------------------------------
    // Test 5: Webhook Idempotency & Event Processing
    // -------------------------------------------------------------
    console.log("▶ [Test 5/5] Testing Webhook Deduplication and Idempotent Processing...");
    const testWebhookEvent = {
      id: `WH-EVT-TEST-${Date.now()}`,
      event_version: "1.0",
      create_time: new Date().toISOString(),
      event_type: "CHECKOUT.ORDER.APPROVED",
      resource_type: "checkout-order",
      resource: {
        id: createData.paypalOrderId || "SAMPLE_PAYPAL_ORDER_ID",
        status: "APPROVED",
      },
    };

    // First attempt: should process
    const whResult1 = await PayPalWebhookService.processWebhookEvent(testWebhookEvent);
    console.log(`  Webhook 1st arrival: status="${whResult1.status}"`);
    if (whResult1.status !== "PROCESSED") {
      throw new Error("First webhook processing attempt failed.");
    }

    // Second attempt with exact same event ID: should recognize as already processed (idempotent)
    const whResult2 = await PayPalWebhookService.processWebhookEvent(testWebhookEvent);
    console.log(`  Webhook 2nd arrival (duplicate): status="${whResult2.status}"`);
    if (whResult2.status !== "ALREADY_PROCESSED") {
      throw new Error("Duplicate webhook was not deduplicated idempotently!");
    }

    console.log("  ✔ Webhook deduplication passed.\n");

    console.log("==================================================");
    console.log("  🎉 ALL STEP 4 PAYPAL INTEGRATION TESTS PASSED!   ");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ Step 4 Verification Failed:", error);
    process.exit(1);
  } finally {
    // Cleanup test data
    console.log("\n▶ Cleaning up test artifacts from PostgreSQL...");
    if (testOrderId) {
      await prisma.inventoryReservation.deleteMany({ where: { orderId: testOrderId } }).catch(() => {});
      await prisma.payment.deleteMany({ where: { orderId: testOrderId } }).catch(() => {});
      await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } }).catch(() => {});
      await prisma.order.delete({ where: { id: testOrderId } }).catch(() => {});
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    console.log("  Cleanup finished.\n");
  }
}

runStep4Verification();

