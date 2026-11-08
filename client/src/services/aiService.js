import axios from "../utils/axiosInstance";
import { API_URL } from "../config";

/**
 * Send a natural language message to the ShopPilot AI Assistant
 * @param {string} message
 * @param {string} conversationId
 * @returns {Promise<object>}
 */
export async function sendChatMessage(message, conversationId) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post(
    `${API_URL}/ai/chat`,
    {
      message,
      conversation_id: conversationId,
    },
    { headers, timeout: 120000 }
  );

  return response.data;
}

/**
 * Request direct grocery plan generation from a validated intent
 * @param {object} intent
 * @param {string} conversationId
 * @returns {Promise<object>}
 */
export async function generateShoppingPlan(intent, conversationId) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post(
    `${API_URL}/ai/plan`,
    {
      intent,
      conversation_id: conversationId,
    },
    { headers }
  );

  return response.data;
}

/**
 * Check AI service health status
 */
export async function getAiHealth() {
  const response = await axios.get(`${API_URL}/ai/health`);
  return response.data;
}

/**
 * Request smart cart optimization for grocery requirements
 * @param {object} params - { grocery_items, budget, dietary_preferences, preferred_brands, conversation_id }
 */
export async function optimizeCart(params) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(`${API_URL}/ai/optimize-cart`, params, { headers });
  return response.data;
}

/**
 * Swap a product with an alternative in the current optimized cart
 */
export async function swapCartItem(currentCart, targetProductId, replacementProductId) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(
    `${API_URL}/ai/reoptimize-cart`,
    {
      current_cart: currentCart,
      target_product_id: targetProductId,
      replacement_product_id: replacementProductId,
      conversation_id: currentCart.conversation_id,
    },
    { headers }
  );
  return response.data;
}

/**
 * 1-Click transfer: Add all optimized items into FreshCart cart
 * @param {Array<{productId: string, quantity: number}>} items
 * @param {boolean} clearFirst
 */
export async function batchAddToCart(items, clearFirst = false) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await axios.post(
    `${API_URL}/cart/batch-add`,
    { items, clearFirst },
    { headers }
  );
  return response.data;
}


