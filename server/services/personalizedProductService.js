/**
 * Deterministic Personalized Product Ranking Service
 * Ranks candidate catalog products using learned user preferences, catalog availability,
 * and price suitability.
 */
export class PersonalizedProductService {
  /**
   * Rank a list of candidate products for a grocery requirement.
   * @param {Array<Object>} candidates - Product models from PostgreSQL
   * @param {Object} requirement - Grocery item specification ({ name, category, estimated_quantity })
   * @param {Object} [userPreferences] - Learned user profile & preferences from UserPreferenceService
   * @returns {Array<Object>} Ranked candidates with detailed score components
   */
  static rankProducts(candidates = [], requirement = {}, userPreferences = null) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return [];
    }

    const reqName = (requirement.name || "").toLowerCase().trim();
    const reqCategory = (requirement.category || "").toLowerCase().trim();
    const reqTokens = reqName
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const preferredBrandMap = new Map();
    if (userPreferences?.preferredBrands) {
      for (const b of userPreferences.preferredBrands) {
        preferredBrandMap.set((b.brand || "").toLowerCase(), b.preferenceScore || 0.8);
      }
    }

    const preferredProductMap = new Map();
    if (userPreferences?.preferredProducts) {
      for (const p of userPreferences.preferredProducts) {
        preferredProductMap.set(p.productId, p.preferenceScore || 0.8);
      }
    }

    const dislikedBrands = new Set(
      (userPreferences?.dislikedBrands || []).map((b) => b.toLowerCase())
    );
    const dislikedProductIds = new Set(userPreferences?.dislikedProductIds || []);

    const scored = candidates.map((prod) => {
      const prodName = (prod.name || "").toLowerCase();
      const prodBrand = (prod.brand || "").toLowerCase().trim();
      const prodCategory = (prod.category || "").toLowerCase().trim();
      const price = prod.offerPrice || prod.price || 0;

      // 1. Availability Score (Strict: 0.0 if out of stock)
      const isAvailable = Boolean(prod.inStock && (prod.stockQuantity === undefined || prod.stockQuantity > 0));
      const availabilityScore = isAvailable ? 1.0 : 0.0;

      // 2. Semantic Relevance Score
      let relevanceScore = 0.2;
      if (reqCategory && prodCategory === reqCategory) {
        relevanceScore += 0.3;
      }
      let tokenHits = 0;
      for (const token of reqTokens) {
        if (prodName.includes(token)) {
          tokenHits += 1;
        }
      }
      if (reqTokens.length > 0) {
        relevanceScore += (tokenHits / reqTokens.length) * 0.5;
      }
      relevanceScore = Math.min(1.0, Math.max(0.0, relevanceScore));

      // 3. Price Suitability Score
      let priceSuitabilityScore = 0.5;
      const priceTier = userPreferences?.profile?.pricePreference || "balanced";
      if (priceTier === "budget_friendly") {
        priceSuitabilityScore = price < 200 ? 1.0 : price < 500 ? 0.7 : 0.3;
      } else if (priceTier === "premium") {
        priceSuitabilityScore = price > 300 ? 1.0 : 0.6;
      } else {
        priceSuitabilityScore = 0.8;
      }

      // 4. Brand Preference Score
      let brandScore = 0.3; // baseline neutral
      if (dislikedBrands.has(prodBrand)) {
        brandScore = 0.0; // strict exclusion
      } else if (preferredBrandMap.has(prodBrand)) {
        brandScore = preferredBrandMap.get(prodBrand);
      }

      // 5. Product Preference Score
      let productPreferenceScore = 0.1; // baseline neutral
      if (dislikedProductIds.has(prod.id)) {
        productPreferenceScore = 0.0; // strict exclusion
      } else if (preferredProductMap.has(prod.id)) {
        productPreferenceScore = preferredProductMap.get(prod.id);
      }

      // If disliked product or brand, zero out total
      if (dislikedBrands.has(prodBrand) || dislikedProductIds.has(prod.id)) {
        return {
          ...prod,
          finalScore: 0.0,
          rankingBreakdown: {
            relevanceScore,
            availabilityScore,
            priceSuitabilityScore,
            brandScore: 0.0,
            productPreferenceScore: 0.0,
            disliked: true,
          },
        };
      }

      // Final Weighted Score
      const finalScore =
        0.35 * relevanceScore +
        0.20 * availabilityScore +
        0.15 * priceSuitabilityScore +
        0.15 * brandScore +
        0.15 * productPreferenceScore;

      return {
        ...prod,
        finalScore: Math.round(finalScore * 10000) / 10000,
        rankingBreakdown: {
          relevanceScore,
          availabilityScore,
          priceSuitabilityScore,
          brandScore,
          productPreferenceScore,
          isAvailable,
        },
      };
    });

    // Sort: In-stock first, then highest finalScore
    scored.sort((a, b) => {
      const aAvail = a.rankingBreakdown.availabilityScore > 0 ? 1 : 0;
      const bAvail = b.rankingBreakdown.availabilityScore > 0 ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;
      return b.finalScore - a.finalScore;
    });

    return scored;
  }
}

export default PersonalizedProductService;
