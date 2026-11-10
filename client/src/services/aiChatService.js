import axios from "../utils/axiosInstance";
import { API_URL } from "../config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Service for persistent AI conversations and semantic long-term memory.
 */
export const aiChatService = {
  // --- Conversations ---
  async fetchConversations({ status = "active", search = "", page = 1, limit = 20 } = {}) {
    const params = { status, search, page, limit };
    const response = await axios.get(`${API_URL}/ai/conversations`, {
      headers: getAuthHeaders(),
      params,
    });
    return response.data;
  },

  async createConversation(title = "New Grocery Plan") {
    const response = await axios.post(
      `${API_URL}/ai/conversations`,
      { title },
      { headers: getAuthHeaders() }
    );
    return response.data.conversation;
  },

  async fetchConversation(conversationId) {
    const response = await axios.get(`${API_URL}/ai/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
    });
    return response.data.conversation;
  },

  async updateConversation(conversationId, { title, status }) {
    const response = await axios.patch(
      `${API_URL}/ai/conversations/${conversationId}`,
      { title, status },
      { headers: getAuthHeaders() }
    );
    return response.data.conversation;
  },

  async deleteConversation(conversationId) {
    const response = await axios.delete(`${API_URL}/ai/conversations/${conversationId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // --- Messages ---
  async fetchMessages(conversationId, { limit = 50, beforeId = null } = {}) {
    const params = { limit };
    if (beforeId) params.beforeId = beforeId;

    const response = await axios.get(`${API_URL}/ai/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
      params,
    });
    return response.data;
  },

  async sendMessage(conversationId, message, messageType = "text") {
    const response = await axios.post(
      `${API_URL}/ai/conversations/${conversationId}/messages`,
      { message, messageType },
      { headers: getAuthHeaders(), timeout: 120000 }
    );
    return response.data;
  },

  // --- Long-Term Memories ---
  async fetchMemories({ category = "all", status = "active" } = {}) {
    const response = await axios.get(`${API_URL}/ai/memories`, {
      headers: getAuthHeaders(),
      params: { category, status },
    });
    return response.data.memories || [];
  },

  async upsertMemory(memoryData) {
    const response = await axios.post(`${API_URL}/ai/memories`, memoryData, {
      headers: getAuthHeaders(),
    });
    return response.data.memory;
  },

  async updateMemory(memoryId, updates) {
    const response = await axios.put(`${API_URL}/ai/memories/${memoryId}`, updates, {
      headers: getAuthHeaders(),
    });
    return response.data.memory;
  },

  async deleteMemory(memoryId) {
    const response = await axios.delete(`${API_URL}/ai/memories/${memoryId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async clearAllMemories() {
    const response = await axios.delete(`${API_URL}/ai/memories`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async syncOrderMemories() {
    const response = await axios.post(
      `${API_URL}/ai/memories/sync-orders`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async fetchMemorySettings() {
    const response = await axios.get(`${API_URL}/ai/memories/settings`, {
      headers: getAuthHeaders(),
    });
    return response.data.settings;
  },

  async updateMemorySettings(settings) {
    const response = await axios.put(`${API_URL}/ai/memories/settings`, settings, {
      headers: getAuthHeaders(),
    });
    return response.data.settings;
  },
};

export default aiChatService;
