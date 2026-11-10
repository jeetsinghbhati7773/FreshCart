import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import aiConversationService from "../services/aiConversationService.js";
import aiMemoryService from "../services/aiMemoryService.js";

async function runChatMemoryVerification() {
  console.log("==================================================================");
  console.log("  ShopPilot: Persistent Chat History & Semantic Memory Test Suite ");
  console.log("==================================================================\n");

  let userA = null;
  let userB = null;
  let conversationA1 = null;
  let conversationA2 = null;
  let conversationB = null;

  try {
    // -------------------------------------------------------------
    // Setup 2 Isolated Test Users
    // -------------------------------------------------------------
    console.log("▶ [Setup] Provisioning User A and User B in PostgreSQL...");
    const timestamp = Date.now();
    userA = await prisma.user.create({
      data: {
        name: `Tester Alice ${timestamp}`,
        email: `alice_${timestamp}@testfreshcart.com`,
        password: "hashed_dummy_password",
      },
    });

    userB = await prisma.user.create({
      data: {
        name: `Tester Bob ${timestamp}`,
        email: `bob_${timestamp}@testfreshcart.com`,
        password: "hashed_dummy_password",
      },
    });

    console.log(`  ✔ User A created: ${userA.id} (${userA.name})`);
    console.log(`  ✔ User B created: ${userB.id} (${userB.name})\n`);

    // -------------------------------------------------------------
    // Test 1: Multiple Independent Conversations per User
    // -------------------------------------------------------------
    console.log("▶ [Test 1/8] Creating multiple conversations for User A...");
    conversationA1 = await aiConversationService.createConversation(userA.id, "Weekly Family Groceries");
    conversationA2 = await aiConversationService.createConversation(userA.id, "Weekend Party Snacks");

    if (!conversationA1.id || !conversationA2.id || conversationA1.id === conversationA2.id) {
      throw new Error("Failed to create distinct conversations for User A");
    }

    const convListA = await aiConversationService.getConversations(userA.id);
    if (convListA.conversations.length < 2) {
      throw new Error(`Expected at least 2 conversations for User A, got ${convListA.conversations.length}`);
    }
    console.log(`  ✔ User A successfully owns ${convListA.conversations.length} independent conversations.\n`);

    // -------------------------------------------------------------
    // Test 2: Message Persistence & Chronological Order
    // -------------------------------------------------------------
    console.log("▶ [Test 2/8] Adding and retrieving persistent messages...");
    const msg1 = await aiConversationService.saveMessage(conversationA1.id, userA.id, {
      role: "user",
      content: "I need groceries for a family of 4 for 7 days within ₹3000",
      messageType: "text",
    });

    const msg2 = await aiConversationService.saveMessage(conversationA1.id, userA.id, {
      role: "assistant",
      content: "Here is your customized 7-day grocery plan for 4 people.",
      messageType: "plan",
      metadata: { estimated_total: 2850, items_count: 8 },
    });

    const messages = await aiConversationService.getMessages(conversationA1.id, userA.id);
    if (messages.messages.length !== 2) {
      throw new Error(`Expected 2 messages in conversation A1, got ${messages.messages.length}`);
    }
    if (messages.messages[0].role !== "user" || messages.messages[1].role !== "assistant") {
      throw new Error("Message chronological ordering is incorrect");
    }
    if (messages.messages[1].metadata?.estimated_total !== 2850) {
      throw new Error("Metadata JSON payload was not correctly stored or retrieved");
    }
    console.log("  ✔ Message persistence and JSON metadata verified.\n");

    // -------------------------------------------------------------
    // Test 3: Resumable Conversation Context & Summaries
    // -------------------------------------------------------------
    console.log("▶ [Test 3/8] Testing conversation summary creation & resumption...");
    const summary = await aiConversationService.saveSummary(
      conversationA1.id,
      userA.id,
      "User planned groceries for family of 4 for 7 days with ₹3000 budget.",
      2
    );

    const latestSummary = await aiConversationService.getLatestSummary(conversationA1.id, userA.id);
    if (!latestSummary || latestSummary.summary !== summary.summary) {
      throw new Error("Failed to retrieve latest conversation summary");
    }

    // Append follow-up message resuming conversation
    const msg3 = await aiConversationService.saveMessage(conversationA1.id, userA.id, {
      role: "user",
      content: "Keep the same budget but make it strictly vegetarian",
      messageType: "text",
    });

    const updatedMessages = await aiConversationService.getMessages(conversationA1.id, userA.id);
    if (updatedMessages.messages.length !== 3) {
      throw new Error("Resumed conversation message count mismatch");
    }
    console.log("  ✔ Conversation resumed with 3 messages and valid summary state.\n");

    // -------------------------------------------------------------
    // Test 4: Strict User Isolation (Zero Cross-User Leakage)
    // -------------------------------------------------------------
    console.log("▶ [Test 4/8] Testing strict User Isolation boundary...");
    conversationB = await aiConversationService.createConversation(userB.id, "Bob's Diet Plan");

    // User B attempts to access User A's conversation
    let unauthorizedAccessCaught = false;
    try {
      await aiConversationService.getConversation(userB.id, conversationA1.id);
    } catch (err) {
      unauthorizedAccessCaught = true;
    }

    if (!unauthorizedAccessCaught) {
      throw new Error("SECURITY FAILURE: User B was able to access User A's conversation!");
    }

    // User B attempts to get User A's messages
    let unauthorizedMessagesCaught = false;
    try {
      await aiConversationService.getMessages(conversationA1.id, userB.id);
    } catch (err) {
      unauthorizedMessagesCaught = true;
    }

    if (!unauthorizedMessagesCaught) {
      throw new Error("SECURITY FAILURE: User B was able to read User A's messages!");
    }

    // Verify Bob's conversation list only includes Bob's items
    const convListB = await aiConversationService.getConversations(userB.id);
    const hasAliceChat = convListB.conversations.some((c) => c.userId === userA.id || c.id === conversationA1.id);
    if (hasAliceChat) {
      throw new Error("SECURITY FAILURE: Bob's conversation list contains Alice's conversation!");
    }
    console.log("  ✔ Cross-user isolation strictly verified. Unauthorized access properly rejected.\n");

    // -------------------------------------------------------------
    // Test 5: Semantic Long-Term Memory Extraction & Categorization
    // -------------------------------------------------------------
    console.log("▶ [Test 5/8] Testing Long-Term Memory upsert and categorization...");
    const mem1 = await aiMemoryService.upsertMemory(userA.id, {
      category: "household_context",
      memoryKey: "household_size",
      memoryValue: 4,
      description: "User shops for a household of 4 people",
      sourceType: "conversation",
      confidence: 0.95,
      importance: 0.9,
    });

    const mem2 = await aiMemoryService.upsertMemory(userA.id, {
      category: "brand_preference",
      memoryKey: "preferred_milk_brand",
      memoryValue: "Amul",
      description: "Prefers Amul for milk and dairy products",
      sourceType: "conversation",
      confidence: 0.9,
      importance: 0.85,
    });

    const memListA = await aiMemoryService.getMemories(userA.id);
    if (memListA.length !== 2) {
      throw new Error(`Expected 2 memories for User A, got ${memListA.length}`);
    }
    console.log(`  ✔ Saved ${memListA.length} long-term memories under correct categories.\n`);

    // -------------------------------------------------------------
    // Test 6: Memory Conflict Resolution & Superseding
    // -------------------------------------------------------------
    console.log("▶ [Test 6/8] Testing Memory Conflict Resolution (Revision)...");
    // User changes brand preference from Amul to Mother Dairy
    const mem2Revised = await aiMemoryService.upsertMemory(userA.id, {
      category: "brand_preference",
      memoryKey: "preferred_milk_brand",
      memoryValue: "Mother Dairy",
      description: "Prefers Mother Dairy for milk and dairy products",
      sourceType: "conversation",
      confidence: 0.95,
      importance: 0.9,
    });

    const activeMems = await aiMemoryService.getMemories(userA.id, { status: "active" });
    const brandMem = activeMems.find((m) => m.memoryKey === "preferred_milk_brand");
    if (!brandMem || brandMem.memoryValue !== "Mother Dairy") {
      throw new Error("Memory conflict resolution failed: Active memory does not reflect new preference");
    }

    const supersededMems = await aiMemoryService.getMemories(userA.id, { status: "superseded" });
    const oldMem = supersededMems.find((m) => m.id === mem2.id);
    if (!oldMem || oldMem.status !== "superseded") {
      throw new Error("Old conflicting memory was not marked as superseded");
    }
    console.log("  ✔ Conflicting memory correctly superseded while new memory is active.\n");

    // -------------------------------------------------------------
    // Test 7: Order History Preference Mining (Paid Orders Only)
    // -------------------------------------------------------------
    console.log("▶ [Test 7/8] Testing Order History Mining on Paid Orders...");
    // Create a mock product and a paid order for User A
    const sampleProduct = await prisma.product.create({
      data: {
        name: `Organic Oats ${timestamp}`,
        description: ["Whole grain rolled oats"],
        price: 250,
        offerPrice: 220,
        category: "Grains",
        image: ["https://example.com/oats.jpg"],
        inStock: true,
      },
    });

    const paidOrder = await prisma.order.create({
      data: {
        userId: userA.id,
        totalAmount: 1500,
        paymentStatus: "Paid",
        status: "Delivered",
        paymentMethod: "Online",
        shippingAddress: "123 Test Street, Bangalore",
        orderItems: {
          create: [
            {
              productId: sampleProduct.id,
              productName: sampleProduct.name,
              quantity: 2,
              unitPrice: 250,
            },
          ],
        },
      },
    });

    const syncResult = await aiMemoryService.syncOrderMemories(userA.id);
    if (syncResult.analyzedOrders < 1) {
      throw new Error("Order history mining failed to analyze paid orders");
    }

    const orderMems = await aiMemoryService.getMemories(userA.id);
    const avgSpendMem = orderMems.find((m) => m.memoryKey === "historical_average_order_spend");
    if (!avgSpendMem || avgSpendMem.sourceType !== "order_history") {
      throw new Error("Order history spend memory was not generated");
    }
    console.log(`  ✔ Order mining analyzed ${syncResult.analyzedOrders} paid orders. Average spend: ₹${syncResult.averageSpend}.\n`);

    // Clean up sample order & product
    await prisma.orderItem.deleteMany({ where: { orderId: paidOrder.id } });
    await prisma.order.delete({ where: { id: paidOrder.id } });
    await prisma.product.delete({ where: { id: sampleProduct.id } });

    // -------------------------------------------------------------
    // Test 8: Memory Inspection, Editing, and Deletion
    // -------------------------------------------------------------
    console.log("▶ [Test 8/8] Testing User Memory inspection, manual edit, and deletion...");
    const memToEdit = await prisma.userMemory.findFirst({
      where: { userId: userA.id, status: "active", memoryKey: "household_size" },
    });

    // Edit memory value
    const edited = await aiMemoryService.updateMemory(userA.id, memToEdit.id, {
      memoryValue: 5,
      description: "User shops for an updated household of 5 people",
    });
    if (edited.memoryValue !== 5 || edited.sourceType !== "user_confirmed") {
      throw new Error("Memory manual update failed");
    }

    // Delete memory
    await aiMemoryService.deleteMemory(userA.id, memToEdit.id);
    const checkDeleted = await prisma.userMemory.findUnique({ where: { id: memToEdit.id } });
    if (checkDeleted) {
      throw new Error("Memory was not permanently deleted");
    }

    // User B attempts to delete User A's memory
    let crossDeleteCaught = false;
    try {
      await aiMemoryService.deleteMemory(userB.id, mem2Revised.id);
    } catch (err) {
      crossDeleteCaught = true;
    }
    if (!crossDeleteCaught) {
      throw new Error("SECURITY FAILURE: User B was able to delete User A's memory!");
    }
    console.log("  ✔ User memory manual edit, deletion, and cross-user deletion guard verified.\n");

    console.log("==================================================================");
    console.log("  🎉 ALL 8 TESTS PASSED! Chat persistence & memory fully verified.");
    console.log("==================================================================");
  } catch (error) {
    console.error("\n❌ VERIFICATION TEST FAILED:", error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    // Teardown Test Data
    console.log("\n▶ [Teardown] Cleaning up test records...");
    try {
      if (conversationA1?.id) await prisma.chatConversation.delete({ where: { id: conversationA1.id } }).catch(() => {});
      if (conversationA2?.id) await prisma.chatConversation.delete({ where: { id: conversationA2.id } }).catch(() => {});
      if (conversationB?.id) await prisma.chatConversation.delete({ where: { id: conversationB.id } }).catch(() => {});
      if (userA?.id) {
        await prisma.userMemory.deleteMany({ where: { userId: userA.id } });
        await prisma.userMemorySetting.deleteMany({ where: { userId: userA.id } });
        await prisma.user.delete({ where: { id: userA.id } });
      }
      if (userB?.id) {
        await prisma.userMemory.deleteMany({ where: { userId: userB.id } });
        await prisma.userMemorySetting.deleteMany({ where: { userId: userB.id } });
        await prisma.user.delete({ where: { id: userB.id } });
      }
      console.log("  ✔ Cleanup complete.");
    } catch (cleanupErr) {
      console.warn("  Warning during cleanup:", cleanupErr.message);
    }
    await prisma.$disconnect();
  }
}

runChatMemoryVerification();
