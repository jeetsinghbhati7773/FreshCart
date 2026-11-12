import { sellerAxios } from "../utils/axiosInstance";

export const sellerAiService = {
  getConversations: async () => {
    const res = await sellerAxios.get("/seller/ai/conversations");
    return res.data;
  },

  createConversation: async (title) => {
    const res = await sellerAxios.post("/seller/ai/conversations", { title });
    return res.data;
  },

  getConversation: async (id) => {
    const res = await sellerAxios.get(`/seller/ai/conversations/${id}`);
    return res.data;
  },

  sendMessage: async ({ conversationId, message }) => {
    const res = await sellerAxios.post("/seller/ai/chat", {
      conversationId,
      message,
    });
    return res.data;
  },

  confirmAction: async (actionId) => {
    const res = await sellerAxios.post(`/seller/ai/actions/${actionId}/confirm`);
    return res.data;
  },

  cancelAction: async (actionId) => {
    const res = await sellerAxios.post(`/seller/ai/actions/${actionId}/cancel`);
    return res.data;
  },
};

