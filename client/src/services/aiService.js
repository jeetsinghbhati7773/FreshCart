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
    { headers }
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

