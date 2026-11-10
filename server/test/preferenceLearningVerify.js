import prisma from "../config/prisma.js";
import PreferenceScoringService from "../services/preferenceScoringService.js";
import UserPreferenceService from "../services/userPreferenceService.js";
import PersonalizedProductService from "../services/personalizedProductService.js";

async function runPreferenceLearningVerification() {
  console.log("=========================================================================");
  console.log("  ShopPilot: Invisible Preference Learning & Personalized AI Test Suite  ");
  console.log("=========================================================================\n");

  let testUserA = null;
  let testUserB = null;
  let productMilkAmul = null;
  let productMilkNestle = null;
  let productBread = null;
  let paidOrder1 = null;
  let paidOrder2 = null;
  let failedOrder = null;

  try {
    const timestamp = Date.now();

    // -------------------------------------------------------------
    // Setup Test Products
    // -------------------------------------------------------------
    console.log("▶ [Setup] Provisioning test catalog products in PostgreSQL...");
    productMilkAmul = await prisma.product.create({
      data: {
        name: `Fresh Taza Milk ${timestamp}`,
        brand: "Amul",
        category: "Dairy",
        price: 64,
        offerPrice: 60,
        unit: "1 ltr",
        inStock: true,
        stockQuantity: 100,
        description: ["Pasteurized toned milk"],
        image: ["https://example.com/amul_milk.jpg"],
      },
    });

    productMilkNestle = await prisma.product.create({
      data: {
        name: `Everyday Milk ${timestamp}`,
        brand: "Nestle",
        category: "Dairy",
        price: 70,
        offerPrice: 68,
        unit: "1 ltr",
        inStock: true,
        stockQuantity: 50,
        description: ["Dairy whitener milk"],
        image: ["https://example.com/nestle_milk.jpg"],
      },
    });

    productBread = await prisma.product.create({
      data: {
        name: `Whole Wheat Bread ${timestamp}`,
        brand: "Modern",
        category: "Bakery",
        price: 45,
        offerPrice: 40,
        unit: "400g",
        inStock: true,
        stockQuantity: 40,
        description: ["100% whole wheat bread loaf"],
        image: ["https://example.com/bread.jpg"],
      },
    });

    console.log("  ✔ Created 3 test products (Amul Milk, Nestle Milk, Modern Bread)\n");

    // -------------------------------------------------------------
    // Setup Isolated Users
    // -------------------------------------------------------------
    console.log("▶ [Setup] Provisioning User A and User B...");
    testUserA = await prisma.user.create({
      data: {
        name: `Shopper Alice ${timestamp}`,
        email: `alice_pref_${timestamp}@freshcart.com`,
        password: "hashed_dummy_password",
      },
    });

    testUserB = await prisma.user.create({
      data: {
        name: `Shopper Bob ${timestamp}`,
        email: `bob_pref_${timestamp}@freshcart.com`,
        password: "hashed_dummy_password",
      },
    });
    console.log(`  ✔ User A: ${testUserA.id}`);
    console.log(`  ✔ User B: ${testUserB.id}\n`);

    // -------------------------------------------------------------
    // Test 1: Deterministic Preference Scoring & Exponential Decay
    // -------------------------------------------------------------
    console.log("▶ [Test 1/7] Testing Deterministic Preference Scoring with Exponential Decay...");
    // Immediate purchase (0 days ago) vs Old purchase (90 days ago)
    const recentScore = PreferenceScoringService.computeProductPreferenceScore({
      purchaseCount: 3,
      daysSinceLastPurchase: 0,
      explicitlyPreferred: false,
      isDisliked: false,
    });

    const oldScore = PreferenceScoringService.computeProductPreferenceScore({
      purchaseCount: 3,
      daysSinceLastPurchase: 90, // 2 half-lives (45d * 2)
      explicitlyPreferred: false,
      isDisliked: false,
    });

    console.log(`  • Recent score (0 days): ${recentScore}`);
    console.log(`  • Aged score (90 days): ${oldScore}`);

    if (recentScore <= oldScore) {
      throw new Error("Exponential decay failed: Recent score must be greater than aged score");
    }

    // Negative preference check: dislike immediately zeros score
    const dislikedScore = PreferenceScoringService.computeProductPreferenceScore({
      purchaseCount: 10,
      daysSinceLastPurchase: 1,
      explicitlyPreferred: true,
      isDisliked: true,
    });

    if (dislikedScore !== 0.0) {
      throw new Error(`Negative preference rule failed: Disliked score should be 0.0, got ${dislikedScore}`);
    }
    console.log("  ✔ Deterministic scoring & exponential decay verified.\n");

    // -------------------------------------------------------------
    // Test 2: Order History Mining (Paid Orders vs Ignored Failed Orders)
    // -------------------------------------------------------------
    console.log("▶ [Test 2/7] Testing Order History Mining from Paid Orders...");
    paidOrder1 = await prisma.order.create({
      data: {
        userId: testUserA.id,
        totalAmount: 160,
        paymentStatus: "Paid",
        status: "Delivered",
        paymentMethod: "PayPal",
        shippingAddress: "123 Green Way, Bangalore",
        orderItems: {
          create: [
            { productId: productMilkAmul.id, quantity: 2, unitPrice: 60, productName: productMilkAmul.name },
            { productId: productBread.id, quantity: 1, unitPrice: 40, productName: productBread.name },
          ],
        },
      },
    });

    paidOrder2 = await prisma.order.create({
      data: {
        userId: testUserA.id,
        totalAmount: 180,
        paymentStatus: "Paid",
        status: "Delivered",
        paymentMethod: "PayPal",
        shippingAddress: "123 Green Way, Bangalore",
        orderItems: {
          create: [
            { productId: productMilkAmul.id, quantity: 3, unitPrice: 60, productName: productMilkAmul.name },
          ],
        },
      },
    });

    // Failed order (Must be strictly ignored)
    failedOrder = await prisma.order.create({
      data: {
        userId: testUserA.id,
        totalAmount: 500,
        paymentStatus: "Failed",
        status: "Cancelled",
        paymentMethod: "PayPal",
        shippingAddress: "123 Green Way, Bangalore",
        orderItems: {
          create: [
            { productId: productMilkNestle.id, quantity: 7, unitPrice: 68, productName: productMilkNestle.name },
          ],
        },
      },
    });

    const profileSummary = await UserPreferenceService.analyzeOrderHistory(testUserA.id);
    if (!profileSummary || profileSummary.typicalBudget !== 170) {
      throw new Error(`Average budget calculation mismatch: expected 170, got ${profileSummary?.typicalBudget}`);
    }

    const amulPref = await prisma.userProductPreference.findUnique({
      where: { userId_productId: { userId: testUserA.id, productId: productMilkAmul.id } },
    });
    if (!amulPref || amulPref.purchaseCount !== 2 || amulPref.totalQuantityPurchased !== 5) {
      throw new Error(`Amul milk stats mismatch: count=${amulPref?.purchaseCount}, qty=${amulPref?.totalQuantityPurchased}`);
    }

    // Verify failed order was ignored
    const nestlePref = await prisma.userProductPreference.findUnique({
      where: { userId_productId: { userId: testUserA.id, productId: productMilkNestle.id } },
    });
    if (nestlePref) {
      throw new Error("SECURITY/ACCURACY FAILURE: Failed order items were improperly included in preferences!");
    }
    console.log("  ✔ Order history accurately mined. Failed orders strictly excluded.\n");

    // -------------------------------------------------------------
    // Test 3: Idempotent Order Updates
    // -------------------------------------------------------------
    console.log("▶ [Test 3/7] Testing Idempotency of Preference Updates...");
    // Running multiple times should not inflate purchase counts
    await UserPreferenceService.updatePreferencesFromOrder(paidOrder1.id);
    await UserPreferenceService.updatePreferencesFromOrder(paidOrder1.id);

    const recheckAmul = await prisma.userProductPreference.findUnique({
      where: { userId_productId: { userId: testUserA.id, productId: productMilkAmul.id } },
    });
    if (recheckAmul.purchaseCount !== 2) {
      throw new Error(`Idempotency failure: Purchase count inflated to ${recheckAmul.purchaseCount}`);
    }
    console.log("  ✔ Idempotent order processing verified.\n");

    // -------------------------------------------------------------
    // Test 4: Explicit Conversational Preference Recording
    // -------------------------------------------------------------
    console.log("▶ [Test 4/7] Testing Explicit Preference Recording (Brand Affinity & Household Size)...");
    await UserPreferenceService.recordBrandPreference(testUserA.id, "Amul", { isDisliked: false });
    await UserPreferenceService.recordHouseholdSize(testUserA.id, 4);

    const brandPref = await prisma.userBrandPreference.findUnique({
      where: { userId_brand: { userId: testUserA.id, brand: "Amul" } },
    });
    if (!brandPref || !brandPref.explicitlyPreferred || brandPref.isDisliked) {
      throw new Error("Brand preference for Amul was not recorded properly");
    }

    const updatedProfile = await prisma.userShoppingProfile.findUnique({
      where: { userId: testUserA.id },
    });
    if (updatedProfile.householdSize !== 4) {
      throw new Error("Household size was not updated in user shopping profile");
    }
    console.log("  ✔ Explicit brand affinity and household context saved.\n");

    // -------------------------------------------------------------
    // Test 5: Dislike Override (Boycott Flag)
    // -------------------------------------------------------------
    console.log("▶ [Test 5/7] Testing Dislike Override on Past Purchases...");
    // User previously bought Amul, but now states: "I don't like Amul anymore"
    await UserPreferenceService.recordBrandPreference(testUserA.id, "Amul", { isDisliked: true });

    const amulDisliked = await prisma.userBrandPreference.findUnique({
      where: { userId_brand: { userId: testUserA.id, brand: "Amul" } },
    });
    if (!amulDisliked || !amulDisliked.isDisliked || amulDisliked.preferenceScore !== 0.0) {
      throw new Error(`Dislike override failed: Brand preference score is ${amulDisliked?.preferenceScore}`);
    }
    console.log("  ✔ Dislike override immediately collapsed preference score to 0.0.\n");

    // -------------------------------------------------------------
    // Test 6: Personalized Product Ranking Engine
    // -------------------------------------------------------------
    console.log("▶ [Test 6/7] Testing PersonalizedProductService Ranking...");
    const learnedA = await UserPreferenceService.getLearnedProfile(testUserA.id);

    const candidates = [
      productMilkAmul,    // brand Amul is disliked by User A
      productMilkNestle,  // in stock, neutral
    ];

    const ranked = PersonalizedProductService.rankProducts(
      candidates,
      { name: "Fresh Milk", category: "Dairy" },
      learnedA
    );

    if (ranked.length < 2) {
      throw new Error("Expected at least 2 ranked candidates");
    }

    // Since Amul is disliked, Nestle must be ranked higher than Amul
    if (ranked[0].id === productMilkAmul.id) {
      throw new Error("Ranking failure: Disliked Amul was ranked first!");
    }
    if (ranked[0].id !== productMilkNestle.id) {
      throw new Error("Expected neutral in-stock Nestle milk to be ranked first");
    }
    console.log(`  • #1 Ranked: ${ranked[0].name} (Score: ${ranked[0].finalScore})`);
    console.log(`  • #2 Ranked: ${ranked[1].name} (Score: ${ranked[1].finalScore})`);
    console.log("  ✔ Personalized product ranking respects negative constraints and availability.\n");

    // -------------------------------------------------------------
    // Test 7: Strict User Isolation (Zero Cross-User Leakage)
    // -------------------------------------------------------------
    console.log("▶ [Test 7/7] Testing Strict User Isolation...");
    // User B explicitly prefers Nestle
    await UserPreferenceService.recordBrandPreference(testUserB.id, "Nestle", { isDisliked: false });
    const learnedB = await UserPreferenceService.getLearnedProfile(testUserB.id);

    // Verify User B's profile does not have User A's Amul dislike
    if (learnedB.dislikedBrands.includes("Amul")) {
      throw new Error("SECURITY LEAK: User A's disliked brand leaked into User B's profile!");
    }

    // Verify User A does not have User B's Nestle preference
    const userAHasNestle = learnedA.preferredBrands.some((b) => b.brand === "Nestle");
    if (userAHasNestle) {
      throw new Error("SECURITY LEAK: User B's preferred brand leaked into User A's profile!");
    }
    console.log("  ✔ Multi-tenant user isolation strictly verified.\n");

    console.log("=========================================================================");
    console.log("  🎉 ALL 7 TESTS PASSED! Invisible preference learning fully verified.    ");
    console.log("=========================================================================");
  } catch (error) {
    console.error("\n❌ VERIFICATION TEST FAILED:", error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    console.log("\n▶ [Teardown] Cleaning up test records...");
    try {
      if (testUserA?.id) {
        await prisma.orderItem.deleteMany({ where: { order: { userId: testUserA.id } } }).catch(() => {});
        await prisma.order.deleteMany({ where: { userId: testUserA.id } }).catch(() => {});
        await prisma.userProductPreference.deleteMany({ where: { userId: testUserA.id } }).catch(() => {});
        await prisma.userBrandPreference.deleteMany({ where: { userId: testUserA.id } }).catch(() => {});
        await prisma.userShoppingProfile.deleteMany({ where: { userId: testUserA.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: testUserA.id } }).catch(() => {});
      }
      if (testUserB?.id) {
        await prisma.userProductPreference.deleteMany({ where: { userId: testUserB.id } }).catch(() => {});
        await prisma.userBrandPreference.deleteMany({ where: { userId: testUserB.id } }).catch(() => {});
        await prisma.userShoppingProfile.deleteMany({ where: { userId: testUserB.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: testUserB.id } }).catch(() => {});
      }
      if (productMilkAmul?.id) await prisma.product.delete({ where: { id: productMilkAmul.id } }).catch(() => {});
      if (productMilkNestle?.id) await prisma.product.delete({ where: { id: productMilkNestle.id } }).catch(() => {});
      if (productBread?.id) await prisma.product.delete({ where: { id: productBread.id } }).catch(() => {});
      console.log("  ✔ Cleanup complete.");
    } catch (cleanupErr) {
      console.warn("  Warning during cleanup:", cleanupErr.message);
    }
    await prisma.$disconnect();
  }
}

runPreferenceLearningVerification();
