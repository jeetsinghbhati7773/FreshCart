import prisma from "../config/prisma.js";

/**
 * Service to manage User-Specific Semantic Long-Term Memories in PostgreSQL.
 */
class AIMemoryService {
  /**
   * Fetch memory settings for a user, creating default if not yet initialized.
   */
  async getSettings(userId) {
    if (!userId) throw new Error("userId is required");

    let setting = await prisma.userMemorySetting.findUnique({
      where: { userId },
    });

    if (!setting) {
      setting = await prisma.userMemorySetting.create({
        data: {
          userId,
          autoExtract: true,
          includeInContext: true,
        },
      });
    }

    return setting;
  }

  /**
   * Update memory settings (e.g. toggle autoExtract or includeInContext).
   */
  async updateSettings(userId, { autoExtract, includeInContext }) {
    if (!userId) throw new Error("userId is required");

    const data = {};
    if (autoExtract !== undefined) data.autoExtract = Boolean(autoExtract);
    if (includeInContext !== undefined) data.includeInContext = Boolean(includeInContext);

    return await prisma.userMemorySetting.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        autoExtract: autoExtract !== undefined ? Boolean(autoExtract) : true,
        includeInContext: includeInContext !== undefined ? Boolean(includeInContext) : true,
      },
    });
  }

  /**
   * Get all active memories for an authenticated user, optionally filtered by category.
   */
  async getMemories(userId, { category, status = "active" } = {}) {
    if (!userId) throw new Error("userId is required");

    const where = {
      userId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    return await prisma.userMemory.findMany({
      where,
      orderBy: [
        { importance: "desc" },
        { updatedAt: "desc" },
      ],
    });
  }

  /**
   * Get single memory with ownership verification.
   */
  async getMemory(userId, memoryId) {
    const memory = await prisma.userMemory.findFirst({
      where: {
        id: memoryId,
        userId,
      },
    });

    if (!memory) {
      const err = new Error("Memory item not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    return memory;
  }

  /**
   * Upsert a memory item with conflict resolution.
   * If a memory with the same key already exists (e.g. preferred_brand_milk),
   * previous memory is marked superseded to preserve memory history.
   */
  async upsertMemory(userId, {
    category,
    memoryKey,
    memoryValue,
    description,
    sourceType = "conversation",
    sourceId = null,
    confidence = 1.0,
    importance = 0.8,
    embedding = null,
  }) {
    if (!userId || !category || !memoryKey || memoryValue === undefined || !description) {
      throw new Error("Missing required fields for memory upsert");
    }

    // Check for existing active memory with the same key
    const existing = await prisma.userMemory.findFirst({
      where: {
        userId,
        memoryKey,
        status: "active",
      },
    });

    if (existing) {
      // If the value is strictly identical, bump lastUsedAt and confidence
      if (JSON.stringify(existing.memoryValue) === JSON.stringify(memoryValue)) {
        return await prisma.userMemory.update({
          where: { id: existing.id },
          data: {
            confidence: Math.min(1.0, existing.confidence + 0.1),
            importance: Math.max(existing.importance, importance),
            description,
            lastUsedAt: new Date(),
          },
        });
      }

      // If conflicting or revised, mark old one as 'superseded'
      await prisma.userMemory.update({
        where: { id: existing.id },
        data: {
          status: "superseded",
        },
      });
    }

    // Create fresh active memory
    return await prisma.userMemory.create({
      data: {
        userId,
        category,
        memoryKey,
        memoryValue,
        description,
        sourceType,
        sourceId,
        confidence,
        importance,
        status: "active",
        embedding: embedding || undefined,
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Update an existing memory (user manual edit).
   */
  async updateMemory(userId, memoryId, { memoryValue, description, category, importance }) {
    await this.getMemory(userId, memoryId); // verify ownership

    const data = {
      sourceType: "user_confirmed",
      updatedAt: new Date(),
    };

    if (memoryValue !== undefined) data.memoryValue = memoryValue;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (importance !== undefined) data.importance = parseFloat(importance);

    return await prisma.userMemory.update({
      where: { id: memoryId },
      data,
    });
  }

  /**
   * Delete memory permanently or soft-delete.
   */
  async deleteMemory(userId, memoryId) {
    await this.getMemory(userId, memoryId); // verify ownership

    return await prisma.userMemory.delete({
      where: { id: memoryId },
    });
  }

  /**
   * Clear all memories for a user (privacy / reset control).
   */
  async clearAllMemories(userId) {
    if (!userId) throw new Error("userId is required");

    const result = await prisma.userMemory.deleteMany({
      where: { userId },
    });

    return { success: true, count: result.count };
  }

  /**
   * Analyze user's completed/paid orders to mine behavioral shopping preferences.
   * Only examines paid orders to avoid phantom signals from abandoned or failed checkouts.
   */
  async syncOrderMemories(userId) {
    if (!userId) throw new Error("userId is required");

    // Fetch user's paid orders with items and products
    const paidOrders = await prisma.order.findMany({
      where: {
        userId,
        paymentStatus: "Paid",
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20, // analyze up to 20 recent paid orders
    });

    if (paidOrders.length === 0) {
      return { syncedCount: 0, message: "No completed paid orders found to analyze" };
    }

    // 1. Calculate Average Spend
    const totalSpend = paidOrders.reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0);
    const avgSpend = Math.round(totalSpend / paidOrders.length);

    await this.upsertMemory(userId, {
      category: "budget_preference",
      memoryKey: "historical_average_order_spend",
      memoryValue: { currency: "INR", average_amount: avgSpend, sample_size: paidOrders.length },
      description: `Customer typically spends ₹${avgSpend} per grocery order based on ${paidOrders.length} previous paid orders`,
      sourceType: "order_history",
      confidence: 0.9,
      importance: 0.85,
    });

    // 2. Tally category frequencies and product frequencies
    const categoryCounts = {};
    const productCounts = {};

    for (const order of paidOrders) {
      for (const item of order.orderItems) {
        const prod = item.product;
        if (!prod) continue;

        if (prod.category) {
          categoryCounts[prod.category] = (categoryCounts[prod.category] || 0) + (item.quantity || 1);
        }

        if (prod.name) {
          productCounts[prod.name] = (productCounts[prod.name] || 0) + (item.quantity || 1);
        }
      }
    }

    // 3. Save Top Frequent Categories
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const topCategories = sortedCategories.slice(0, 3).map(([cat]) => cat);
      await this.upsertMemory(userId, {
        category: "shopping_preference",
        memoryKey: "frequent_grocery_categories",
        memoryValue: topCategories,
        description: `Frequently purchased categories: ${topCategories.join(", ")}`,
        sourceType: "order_history",
        confidence: 0.88,
        importance: 0.8,
      });
    }

    // 4. Save Top Repeat Grocery Items
    const repeatItems = Object.entries(productCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ item: name, purchased_times: count }));

    if (repeatItems.length > 0) {
      await this.upsertMemory(userId, {
        category: "shopping_preference",
        memoryKey: "staple_repeat_products",
        memoryValue: repeatItems.map((r) => r.item),
        description: `Staple grocery items regularly repurchased: ${repeatItems.map((r) => r.item).join(", ")}`,
        sourceType: "order_history",
        confidence: 0.95,
        importance: 0.9,
      });
    }

    return {
      syncedCount: 3,
      analyzedOrders: paidOrders.length,
      averageSpend: avgSpend,
    };
  }

  /**
   * Retrieve relevant active memories for a given query text.
   * Matches semantic keywords and importance weighting.
   */
  async retrieveRelevantMemories(userId, queryText = "", limit = 8) {
    if (!userId) return [];

    const settings = await this.getSettings(userId);
    if (!settings.includeInContext) {
      return [];
    }

    const memories = await prisma.userMemory.findMany({
      where: {
        userId,
        status: "active",
      },
    });

    if (memories.length === 0) return [];

    const queryLower = (queryText || "").toLowerCase();
    const queryTokens = queryLower
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    // Score memories based on keyword overlap, confidence, and importance
    const scored = memories.map((mem) => {
      let score = mem.importance * 0.4 + mem.confidence * 0.2;

      const memText = `${mem.category} ${mem.memoryKey} ${mem.description} ${JSON.stringify(mem.memoryValue)}`.toLowerCase();

      // Check token hits
      let hitCount = 0;
      for (const token of queryTokens) {
        if (memText.includes(token)) {
          hitCount += 1;
        }
      }

      if (queryTokens.length > 0) {
        score += (hitCount / queryTokens.length) * 0.8;
      }

      // Universal baseline relevance: budget and household context are almost always relevant
      if (mem.category === "household_context" || mem.category === "dietary_preference") {
        score += 0.25;
      }

      return {
        ...mem,
        relevanceScore: score,
      };
    });

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const relevant = scored.slice(0, limit);

    // Touch lastUsedAt asynchronously
    const ids = relevant.map((m) => m.id);
    if (ids.length > 0) {
      prisma.userMemory
        .updateMany({
          where: { id: { in: ids } },
          data: { lastUsedAt: new Date() },
        })
        .catch(() => {});
    }

    return relevant;
  }
}

export default new AIMemoryService();
