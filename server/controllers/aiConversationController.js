import aiConversationService from "../services/aiConversationService.js";
import aiMemoryService from "../services/aiMemoryService.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8005";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "shoppilot_internal_secret_key_step2_2026";

/**
 * Controller for managing user conversations and persistent AI message history.
 */
class AIConversationController {
  /**
   * POST /api/ai/conversations
   */
  async createConversation(req, res) {
    try {
      const { title } = req.body;
      const conversation = await aiConversationService.createConversation(req.user.id, title);
      return res.status(201).json({
        success: true,
        conversation,
      });
    } catch (err) {
      console.error("Create conversation error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to create conversation",
      });
    }
  }

  /**
   * GET /api/ai/conversations
   */
  async getConversations(req, res) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await aiConversationService.getConversations(req.user.id, {
        status,
        search,
        page,
        limit,
      });
      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error("Get conversations error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to list conversations",
      });
    }
  }

  /**
   * GET /api/ai/conversations/:id
   */
  async getConversation(req, res) {
    try {
      const conversation = await aiConversationService.getConversation(req.user.id, req.params.id);
      return res.json({
        success: true,
        conversation,
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to retrieve conversation",
      });
    }
  }

  /**
   * PATCH /api/ai/conversations/:id
   */
  async updateConversation(req, res) {
    try {
      const { title, status } = req.body;
      const conversation = await aiConversationService.updateConversation(
        req.user.id,
        req.params.id,
        { title, status }
      );
      return res.json({
        success: true,
        conversation,
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to update conversation",
      });
    }
  }

  /**
   * DELETE /api/ai/conversations/:id
   */
  async deleteConversation(req, res) {
    try {
      await aiConversationService.deleteConversation(req.user.id, req.params.id);
      return res.json({
        success: true,
        message: "Conversation deleted successfully",
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to delete conversation",
      });
    }
  }

  /**
   * GET /api/ai/conversations/:id/messages
   */
  async getMessages(req, res) {
    try {
      const { limit, beforeId } = req.query;
      const result = await aiConversationService.getMessages(req.params.id, req.user.id, {
        limit,
        beforeId,
      });
      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to retrieve messages",
      });
    }
  }

  /**
   * POST /api/ai/conversations/:id/messages
   * Central orchestrator for persistent chat:
   * 1. Verifies ownership and saves user message to PostgreSQL.
   * 2. Retrieves relevant long-term memories and conversation summary.
   * 3. Forwards context to FastAPI LangGraph assistant.
   * 4. Asynchronously extracts any newly stated user preferences.
   * 5. Saves assistant message in PostgreSQL with rich shopping metadata.
   */
  async sendMessage(req, res) {
    try {
      const conversationId = req.params.id;
      const userId = req.user.id;
      const { message, messageType = "text" } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "A non-empty message string is required",
        });
      }

      const trimmedContent = message.trim();

      // 1. Save user message to PostgreSQL
      const savedUserMessage = await aiConversationService.saveMessage(conversationId, userId, {
        role: "user",
        content: trimmedContent,
        messageType,
      });

      // 2. Fetch relevant long-term memories & summary
      const [relevantMemories, summaryObj] = await Promise.all([
        aiMemoryService.retrieveRelevantMemories(userId, trimmedContent, 6),
        aiConversationService.getLatestSummary(conversationId, userId),
      ]);

      // 3. Forward to Python FastAPI AI microservice
      const payload = {
        conversation_id: conversationId,
        user_id: userId,
        message: trimmedContent,
        user_memories: relevantMemories.map((m) => ({
          category: m.category,
          key: m.memoryKey,
          value: m.memoryValue,
          description: m.description,
          importance: m.importance,
        })),
        conversation_summary: summaryObj ? summaryObj.summary : null,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      let aiData = null;
      let aiOffline = false;

      try {
        const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-api-key": INTERNAL_API_KEY,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          throw new Error(`AI microservice returned HTTP ${aiResponse.status}: ${errText}`);
        }

        aiData = await aiResponse.json();
      } catch (callErr) {
        clearTimeout(timeoutId);
        console.error("AI Microservice communication error:", callErr.message);
        aiOffline = true;
      }

      // If AI service is offline, provide graceful fallback while preserving conversation history
      let assistantContent = "";
      let metadata = {};
      let responseMessageType = "text";

      if (aiOffline || !aiData) {
        assistantContent =
          "⚠️ AI Shopping Assistant is currently unavailable. Ensure the AI microservice is running on port 8005 ('npm run ai'). Your message has been saved and can be resumed once the service is running.";
      } else {
        assistantContent =
          aiData.message ||
          (aiData.clarification_question ? aiData.clarification_question : "Your grocery plan is ready.");
        
        responseMessageType = aiData.grocery_plan ? "plan" : "text";

        metadata = {
          grocery_plan: aiData.grocery_plan || null,
          matched_products: aiData.matched_products || null,
          optimized_cart: aiData.optimized_cart || null,
          applied_memories: relevantMemories.map((m) => m.description),
          stage: aiData.stage || null,
        };
      }

      // 4. Save assistant response to PostgreSQL
      const savedAssistantMessage = await aiConversationService.saveMessage(
        conversationId,
        userId,
        {
          role: "assistant",
          content: assistantContent,
          messageType: responseMessageType,
          metadata,
        }
      );

      // 5. Asynchronously trigger memory extraction if active
      this.triggerAsyncMemoryExtraction(userId, conversationId, trimmedContent).catch((err) =>
        console.error("Async memory extraction error:", err.message)
      );

      return res.json({
        success: true,
        userMessage: savedUserMessage,
        assistantMessage: savedAssistantMessage,
        appliedMemories: relevantMemories.map((m) => ({
          key: m.memoryKey,
          description: m.description,
          category: m.category,
        })),
        aiResponse: aiData,
      });
    } catch (err) {
      console.error("SendMessage Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to process chat message",
      });
    }
  }

  /**
   * Extract shopping habits, household context, brand loyalty, or budget rules from user text.
   */
  async triggerAsyncMemoryExtraction(userId, conversationId, userText) {
    try {
      const settings = await aiMemoryService.getSettings(userId);
      if (!settings.autoExtract) return;

      const lower = userText.toLowerCase();

      // Rule 1: Household size
      const householdMatch = lower.match(
        /(?:family of|household of|groceries for|for|living with)\s+(\d+)\s*(?:people|persons|members|adults)?/i
      );
      if (householdMatch && parseInt(householdMatch[1], 10) > 0) {
        const count = parseInt(householdMatch[1], 10);
        await aiMemoryService.upsertMemory(userId, {
          category: "household_context",
          memoryKey: "household_size",
          memoryValue: count,
          description: `User shops for a household of ${count} people`,
          sourceType: "conversation",
          sourceId: conversationId,
          confidence: 0.95,
          importance: 0.9,
        });
      }

      // Rule 2: Dietary preference
      if (lower.includes("vegetarian") || lower.includes("pure veg") || lower.includes("only veg")) {
        await aiMemoryService.upsertMemory(userId, {
          category: "dietary_preference",
          memoryKey: "dietary_type",
          memoryValue: "Vegetarian",
          description: "Prefers strictly vegetarian grocery items",
          sourceType: "conversation",
          sourceId: conversationId,
          confidence: 0.98,
          importance: 0.95,
        });
      } else if (lower.includes("vegan")) {
        await aiMemoryService.upsertMemory(userId, {
          category: "dietary_preference",
          memoryKey: "dietary_type",
          memoryValue: "Vegan",
          description: "Strict vegan diet; exclude dairy, eggs, meat, and honey",
          sourceType: "conversation",
          sourceId: conversationId,
          confidence: 0.98,
          importance: 0.95,
        });
      } else if (lower.includes("gluten-free") || lower.includes("gluten free")) {
        await aiMemoryService.upsertMemory(userId, {
          category: "dietary_preference",
          memoryKey: "allergy_gluten",
          memoryValue: "Gluten-Free",
          description: "Avoid gluten-containing flours, breads, and grains",
          sourceType: "conversation",
          sourceId: conversationId,
          confidence: 0.98,
          importance: 0.95,
        });
      }

      // Rule 3: Brand preference
      const brandMatch = userText.match(
        /(?:prefer|always buy|only buy|favourite brand is|love)\s+([A-Z][a-zA-Z0-9\s]{2,20})\s+(?:milk|bread|butter|rice|atta|tea|coffee|oil|ghee)/i
      );
      if (brandMatch) {
        const brandName = brandMatch[1].trim();
        await aiMemoryService.upsertMemory(userId, {
          category: "brand_preference",
          memoryKey: `preferred_brand_${brandName.toLowerCase().replace(/\s+/g, "_")}`,
          memoryValue: brandName,
          description: `Prefers ${brandName} brand for grocery staples`,
          sourceType: "conversation",
          sourceId: conversationId,
          confidence: 0.9,
          importance: 0.85,
        });
      }

      // Rule 4: Budget constraints
      const budgetMatch = lower.match(
        /(?:budget|max spend|under|within|cap at)\s*(?:of|is)?\s*(?:₹|rs\.?|inr)?\s*(\d{3,6})/i
      );
      if (budgetMatch) {
        const amount = parseInt(budgetMatch[1], 10);
        if (amount >= 200 && amount <= 50000) {
          await aiMemoryService.upsertMemory(userId, {
            category: "budget_preference",
            memoryKey: "stated_target_budget",
            memoryValue: { amount, currency: "INR" },
            description: `Target grocery budget typically around ₹${amount}`,
            sourceType: "conversation",
            sourceId: conversationId,
            confidence: 0.85,
            importance: 0.8,
          });
        }
      }
    } catch (err) {
      console.warn("Preference extraction warning:", err.message);
    }
  }
}

export default new AIConversationController();
