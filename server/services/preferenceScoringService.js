/**
 * Deterministic Preference Scoring Service with Exponential Time-Decay
 * Calculates standardized 0.0 to 1.0 preference scores for products and brands.
 */
export class PreferenceScoringService {
  static HALF_LIFE_DAYS = 45.0; // Purchases decay by half every 45 days
  static DECAY_CONSTANT = Math.LN2 / PreferenceScoringService.HALF_LIFE_DAYS;

  /**
   * Calculate recency score using exponential time decay.
   * @param {number} daysSinceLastPurchase
   * @returns {number} Score between 0.0 and 1.0
   */
  static calculateRecencyScore(daysSinceLastPurchase) {
    if (daysSinceLastPurchase === null || daysSinceLastPurchase === undefined || isNaN(daysSinceLastPurchase)) {
      return 0.2; // default neutral recency for unmeasured intervals
    }
    const days = Math.max(0, parseFloat(daysSinceLastPurchase));
    return Math.exp(-this.DECAY_CONSTANT * days);
  }

  /**
   * Calculate deterministic product preference score.
   * @param {Object} params
   * @param {number} params.purchaseCount
   * @param {number} [params.daysSinceLastPurchase=0]
   * @param {boolean} [params.explicitlyPreferred=false]
   * @param {boolean} [params.isDisliked=false]
   * @param {number} [params.repeatSelectionCount=0]
   * @returns {number} Score between 0.0 and 1.0
   */
  static computeProductPreferenceScore({
    purchaseCount = 0,
    daysSinceLastPurchase = 0,
    explicitlyPreferred = false,
    isDisliked = false,
    repeatSelectionCount = 0,
  }) {
    // Negative preference rule: Dislike overrides past purchases completely
    if (isDisliked) {
      return 0.0;
    }

    // 1. Purchase Frequency Score (saturates at 5 purchases)
    const frequencyScore = Math.min(1.0, Math.max(0, purchaseCount) / 5.0);

    // 2. Recency Score with exponential decay
    const recencyScore = this.calculateRecencyScore(daysSinceLastPurchase);

    // 3. Explicit Preference Statement Score
    const explicitScore = explicitlyPreferred ? 1.0 : 0.0;

    // 4. Repeated Cart Selection / Accepted Swap Score (saturates at 3 times)
    const repeatScore = Math.min(1.0, Math.max(0, repeatSelectionCount) / 3.0);

    // Weighted composite
    const score =
      0.35 * frequencyScore +
      0.30 * recencyScore +
      0.20 * explicitScore +
      0.15 * repeatScore;

    return Math.min(1.0, Math.max(0.0, Math.round(score * 10000) / 10000));
  }

  /**
   * Calculate deterministic brand preference score.
   * @param {Object} params
   * @param {number} params.purchaseCount
   * @param {number} [params.daysSinceLastPurchase=0]
   * @param {boolean} [params.explicitlyPreferred=false]
   * @param {boolean} [params.isDisliked=false]
   * @returns {number} Score between 0.0 and 1.0
   */
  static computeBrandPreferenceScore({
    purchaseCount = 0,
    daysSinceLastPurchase = 0,
    explicitlyPreferred = false,
    isDisliked = false,
  }) {
    if (isDisliked) {
      return 0.0;
    }

    const frequencyScore = Math.min(1.0, Math.max(0, purchaseCount) / 4.0);
    const recencyScore = this.calculateRecencyScore(daysSinceLastPurchase);
    const explicitScore = explicitlyPreferred ? 1.0 : 0.0;

    const score =
      0.45 * frequencyScore +
      0.35 * recencyScore +
      0.20 * explicitScore;

    return Math.min(1.0, Math.max(0.0, Math.round(score * 10000) / 10000));
  }
}

export default PreferenceScoringService;

