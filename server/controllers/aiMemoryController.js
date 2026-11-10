import aiMemoryService from "../services/aiMemoryService.js";

/**
 * Controller for user-facing semantic long-term memory operations.
 */
class AIMemoryController {
  /**
   * GET /api/ai/memories
   */
  async getMemories(req, res) {
    try {
      const { category, status } = req.query;
      const memories = await aiMemoryService.getMemories(req.user.id, {
        category,
        status,
      });

      return res.json({
        success: true,
        memories,
      });
    } catch (err) {
      console.error("Get memories error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to retrieve memories",
      });
    }
  }

  /**
   * POST /api/ai/memories
   */
  async upsertMemory(req, res) {
    try {
      const { category, memoryKey, memoryValue, description, importance } = req.body;

      if (!category || !memoryKey || memoryValue === undefined || !description) {
        return res.status(400).json({
          success: false,
          message: "category, memoryKey, memoryValue, and description are required",
        });
      }

      const memory = await aiMemoryService.upsertMemory(req.user.id, {
        category,
        memoryKey,
        memoryValue,
        description,
        sourceType: "user_confirmed",
        importance: importance ? parseFloat(importance) : 0.9,
      });

      return res.status(201).json({
        success: true,
        memory,
      });
    } catch (err) {
      console.error("Upsert memory error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to save memory",
      });
    }
  }

  /**
   * PUT /api/ai/memories/:id
   */
  async updateMemory(req, res) {
    try {
      const { memoryValue, description, category, importance } = req.body;
      const memory = await aiMemoryService.updateMemory(req.user.id, req.params.id, {
        memoryValue,
        description,
        category,
        importance,
      });

      return res.json({
        success: true,
        memory,
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to update memory",
      });
    }
  }

  /**
   * DELETE /api/ai/memories/:id
   */
  async deleteMemory(req, res) {
    try {
      await aiMemoryService.deleteMemory(req.user.id, req.params.id);
      return res.json({
        success: true,
        message: "Memory item deleted successfully",
      });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({
        success: false,
        message: err.message || "Failed to delete memory",
      });
    }
  }

  /**
   * DELETE /api/ai/memories
   * Clear all memories for user
   */
  async clearAllMemories(req, res) {
    try {
      const result = await aiMemoryService.clearAllMemories(req.user.id);
      return res.json({
        success: true,
        message: `Cleared ${result.count} memories`,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to clear memories",
      });
    }
  }

  /**
   * POST /api/ai/memories/sync-orders
   * Scans user's paid orders and extracts purchase patterns
   */
  async syncOrderMemories(req, res) {
    try {
      const result = await aiMemoryService.syncOrderMemories(req.user.id);
      return res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error("Sync order memories error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to sync order history memories",
      });
    }
  }

  /**
   * GET /api/ai/memories/settings
   */
  async getSettings(req, res) {
    try {
      const settings = await aiMemoryService.getSettings(req.user.id);
      return res.json({
        success: true,
        settings,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to get memory settings",
      });
    }
  }

  /**
   * PUT /api/ai/memories/settings
   */
  async updateSettings(req, res) {
    try {
      const { autoExtract, includeInContext } = req.body;
      const settings = await aiMemoryService.updateSettings(req.user.id, {
        autoExtract,
        includeInContext,
      });
      return res.json({
        success: true,
        settings,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to update memory settings",
      });
    }
  }
}

export default new AIMemoryController();

