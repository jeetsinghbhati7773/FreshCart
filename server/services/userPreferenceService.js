import prisma from "../config/prisma.js";
import PreferenceScoringService from "./preferenceScoringService.js";

/**
 * Service to analyze customer order history and manage the internal UserShoppingProfile,
 * UserProductPreference, and UserBrandPreference entities silently in the background.
 */
export class UserPreferenceService {
  /**
   * Mine eligible paid orders to build deterministic product, brand, category and spending preferences.
   * @param {string} userId
   * @returns {Promise<Object>} Aggregated profile summary
   */
  static async analyzeOrderHistory(userId) {
    if (!userId) throw new Error("userId is required for preference analysis");

    // Strictly eligible completed & paid orders
    const paidOrders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentStatus: "Paid" },
          { status: "Delivered" },
          { status: "Completed" },
        ],
        AND: [
          { status: { notIn: ["Cancelled", "Refunded", "Failed"] } },
          { paymentStatus: { notIn: ["Failed", "Cancelled"] } },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (paidOrders.length === 0) {
      // Return or ensure default baseline profile
      return await this.ensureBaselineProfile(userId);
    }

    const now = new Date();
    const productStats = {}; // productId -> { count, quantity, firstDate, lastDate, brand, category, productName }
    const brandStats = {}; // brandName -> { count, lastDate }
    const categoryStats = {}; // categoryName -> count
    let totalSpend = 0;
    const orderDates = [];

    for (const order of paidOrders) {
      totalSpend += order.totalAmount || 0;
      orderDates.push(new Date(order.createdAt));

      for (const item of order.orderItems) {
        const prodId = item.productId;
        const prod = item.product;
        const qty = item.quantity || 1;
        const orderDate = new Date(order.createdAt);

        // 1. Product Stats
        if (!productStats[prodId]) {
          productStats[prodId] = {
            productId: prodId,
            productName: prod?.name || item.productName || "Product",
            brand: prod?.brand || null,
            category: prod?.category || "Groceries",
            count: 0,
            quantity: 0,
            firstDate: orderDate,
            lastDate: orderDate,
            dates: [],
          };
        }
        productStats[prodId].count += 1;
        productStats[prodId].quantity += qty;
        productStats[prodId].dates.push(orderDate);
        if (orderDate > productStats[prodId].lastDate) {
          productStats[prodId].lastDate = orderDate;
        }
        if (orderDate < productStats[prodId].firstDate) {
          productStats[prodId].firstDate = orderDate;
        }

        // 2. Brand Stats
        const brandName = prod?.brand?.trim();
        if (brandName && brandName.toLowerCase() !== "generic") {
          if (!brandStats[brandName]) {
            brandStats[brandName] = { count: 0, lastDate: orderDate };
          }
          brandStats[brandName].count += 1;
          if (orderDate > brandStats[brandName].lastDate) {
            brandStats[brandName].lastDate = orderDate;
          }
        }

        // 3. Category Stats
        const cat = prod?.category || "Groceries";
        categoryStats[cat] = (categoryStats[cat] || 0) + qty;
      }
    }

    // Typical budget & interval
    const typicalBudget = Math.round(totalSpend / paidOrders.length);
    let typicalShoppingInterval = 7; // default weekly
    if (orderDates.length >= 2) {
      const dayDiffs = [];
      for (let i = 1; i < orderDates.length; i++) {
        const diffDays = Math.round((orderDates[i] - orderDates[i - 1]) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) dayDiffs.push(diffDays);
      }
      if (dayDiffs.length > 0) {
        typicalShoppingInterval = Math.round(dayDiffs.reduce((a, b) => a + b, 0) / dayDiffs.length);
      }
    }

    // Determine price preference (budget vs premium)
    let pricePreference = "balanced";
    if (typicalBudget < 1500) {
      pricePreference = "budget_friendly";
    } else if (typicalBudget > 4500) {
      pricePreference = "premium";
    }

    // Upsert UserProductPreferences
    for (const [prodId, p] of Object.entries(productStats)) {
      const daysSince = (now - p.lastDate) / (1000 * 60 * 60 * 24);
      let avgInterval = null;
      if (p.dates.length >= 2) {
        let sumInt = 0;
        for (let i = 1; i < p.dates.length; i++) {
          sumInt += (p.dates[i] - p.dates[i - 1]) / (1000 * 60 * 60 * 24);
        }
        avgInterval = Math.round((sumInt / (p.dates.length - 1)) * 10) / 10;
      }

      // Preserve any existing explicit preferences or dislike flags
      const existing = await prisma.userProductPreference.findUnique({
        where: { userId_productId: { userId, productId: prodId } },
      });

      const explicitlyPreferred = existing ? existing.explicitlyPreferred : false;
      const isDisliked = existing ? existing.isDisliked : false;

      const preferenceScore = PreferenceScoringService.computeProductPreferenceScore({
        purchaseCount: p.count,
        daysSinceLastPurchase: daysSince,
        explicitlyPreferred,
        isDisliked,
        repeatSelectionCount: p.count > 1 ? p.count - 1 : 0,
      });

      await prisma.userProductPreference.upsert({
        where: { userId_productId: { userId, productId: prodId } },
        update: {
          purchaseCount: p.count,
          totalQuantityPurchased: p.quantity,
          lastPurchasedAt: p.lastDate,
          firstPurchasedAt: p.firstDate,
          averagePurchaseInterval: avgInterval,
          preferenceScore,
        },
        create: {
          userId,
          productId: prodId,
          purchaseCount: p.count,
          totalQuantityPurchased: p.quantity,
          lastPurchasedAt: p.lastDate,
          firstPurchasedAt: p.firstDate,
          averagePurchaseInterval: avgInterval,
          preferenceScore,
          explicitlyPreferred,
          isDisliked,
        },
      });
    }

    // Upsert UserBrandPreferences
    for (const [brand, b] of Object.entries(brandStats)) {
      const daysSince = (now - b.lastDate) / (1000 * 60 * 60 * 24);

      const existing = await prisma.userBrandPreference.findUnique({
        where: { userId_brand: { userId, brand } },
      });

      const explicitlyPreferred = existing ? existing.explicitlyPreferred : false;
      const isDisliked = existing ? existing.isDisliked : false;

      const preferenceScore = PreferenceScoringService.computeBrandPreferenceScore({
        purchaseCount: b.count,
        daysSinceLastPurchase: daysSince,
        explicitlyPreferred,
        isDisliked,
      });

      await prisma.userBrandPreference.upsert({
        where: { userId_brand: { userId, brand } },
        update: {
          purchaseCount: b.count,
          lastPurchasedAt: b.lastDate,
          preferenceScore,
        },
        create: {
          userId,
          brand,
          purchaseCount: b.count,
          lastPurchasedAt: b.lastDate,
          preferenceScore,
          explicitlyPreferred,
          isDisliked,
        },
      });
    }

    // Build Aggregated Arrays for Profile
    const sortedCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ category: cat, frequency: count }));

    const topBrands = Object.entries(brandStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([br, data]) => ({ brand: br, purchaseCount: data.count }));

    const topProducts = Object.values(productStats)
      .filter((p) => p.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((p) => ({ productId: p.productId, name: p.productName, purchaseCount: p.count }));

    // Upsert UserShoppingProfile
    const profile = await prisma.userShoppingProfile.upsert({
      where: { userId },
      update: {
        preferredCategories: sortedCategories,
        preferredBrands: topBrands,
        frequentlyPurchasedProducts: topProducts,
        typicalBudget,
        pricePreference,
        typicalShoppingInterval,
        lastAnalyzedAt: now,
      },
      create: {
        userId,
        preferredCategories: sortedCategories,
        preferredBrands: topBrands,
        frequentlyPurchasedProducts: topProducts,
        typicalBudget,
        pricePreference,
        typicalShoppingInterval,
        lastAnalyzedAt: now,
      },
    });

    return profile;
  }

  /**
   * Helper to ensure baseline shopping profile exists for a user.
   */
  static async ensureBaselineProfile(userId) {
    return await prisma.userShoppingProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        preferredCategories: [],
        preferredBrands: [],
        frequentlyPurchasedProducts: [],
        pricePreference: "balanced",
        typicalBudget: 2500,
        budgetCurrency: "INR",
        typicalShoppingInterval: 7,
      },
    });
  }

  /**
   * Retrieve the user's complete learned profile including top products and brands.
   * Scoped strictly to authenticated userId.
   */
  static async getLearnedProfile(userId) {
    if (!userId) return null;

    const [profile, productPrefs, brandPrefs] = await Promise.all([
      prisma.userShoppingProfile.findUnique({ where: { userId } }),
      prisma.userProductPreference.findMany({
        where: { userId, isDisliked: false },
        orderBy: { preferenceScore: "desc" },
        take: 12,
        include: { product: true },
      }),
      prisma.userBrandPreference.findMany({
        where: { userId, isDisliked: false },
        orderBy: { preferenceScore: "desc" },
        take: 8,
      }),
    ]);

    const dislikedBrands = await prisma.userBrandPreference.findMany({
      where: { userId, isDisliked: true },
      select: { brand: true },
    });

    const dislikedProducts = await prisma.userProductPreference.findMany({
      where: { userId, isDisliked: true },
      select: { productId: true },
    });

    return {
      profile: profile || {
        typicalBudget: 2500,
        pricePreference: "balanced",
        preferredCategories: [],
        preferredBrands: [],
        householdSize: null,
      },
      preferredProducts: productPrefs,
      preferredBrands: brandPrefs,
      dislikedBrands: dislikedBrands.map((b) => b.brand),
      dislikedProductIds: dislikedProducts.map((p) => p.productId),
    };
  }

  /**
   * Record explicit brand preference or dislike derived from conversational input.
   */
  static async recordBrandPreference(userId, brandName, { isDisliked = false } = {}) {
    if (!userId || !brandName) return;
    const cleanBrand = brandName.trim();

    const existing = await prisma.userBrandPreference.findUnique({
      where: { userId_brand: { userId, brand: cleanBrand } },
    });

    const purchaseCount = existing ? existing.purchaseCount : 0;
    const daysSince = existing?.lastPurchasedAt
      ? (new Date() - existing.lastPurchasedAt) / (1000 * 60 * 60 * 24)
      : 0;

    const preferenceScore = isDisliked
      ? 0.0
      : PreferenceScoringService.computeBrandPreferenceScore({
          purchaseCount,
          daysSinceLastPurchase: daysSince,
          explicitlyPreferred: true,
          isDisliked: false,
        });

    return await prisma.userBrandPreference.upsert({
      where: { userId_brand: { userId, brand: cleanBrand } },
      update: {
        explicitlyPreferred: !isDisliked,
        isDisliked,
        preferenceScore,
      },
      create: {
        userId,
        brand: cleanBrand,
        purchaseCount,
        preferenceScore,
        explicitlyPreferred: !isDisliked,
        isDisliked,
      },
    });
  }

  /**
   * Record explicit product preference or dislike.
   */
  static async recordProductPreference(userId, productId, { isDisliked = false } = {}) {
    if (!userId || !productId) return;

    const existing = await prisma.userProductPreference.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    const purchaseCount = existing ? existing.purchaseCount : 0;
    const daysSince = existing?.lastPurchasedAt
      ? (new Date() - existing.lastPurchasedAt) / (1000 * 60 * 60 * 24)
      : 0;

    const preferenceScore = isDisliked
      ? 0.0
      : PreferenceScoringService.computeProductPreferenceScore({
          purchaseCount,
          daysSinceLastPurchase: daysSince,
          explicitlyPreferred: true,
          isDisliked: false,
          repeatSelectionCount: existing ? existing.purchaseCount : 0,
        });

    return await prisma.userProductPreference.upsert({
      where: { userId_productId: { userId, productId } },
      update: {
        explicitlyPreferred: !isDisliked,
        isDisliked,
        preferenceScore,
      },
      create: {
        userId,
        productId,
        purchaseCount,
        preferenceScore,
        explicitlyPreferred: !isDisliked,
        isDisliked,
      },
    });
  }

  /**
   * Record explicit household size from conversation.
   */
  static async recordHouseholdSize(userId, householdSize) {
    if (!userId || !householdSize) return;
    const size = parseInt(householdSize, 10);
    if (isNaN(size) || size <= 0) return;

    return await prisma.userShoppingProfile.upsert({
      where: { userId },
      update: { householdSize: size },
      create: { userId, householdSize: size },
    });
  }

  /**
   * Idempotent trigger called after successful order payment.
   */
  static async updatePreferencesFromOrder(orderId) {
    if (!orderId) return;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, paymentStatus: true, status: true },
    });

    if (order && (order.paymentStatus === "Paid" || order.status === "Delivered")) {
      await this.analyzeOrderHistory(order.userId);
    }
  }
}

export default UserPreferenceService;

