import prisma from "../config/prisma.js";

/**
 * Service to manage persistent AI chat conversations and messages in PostgreSQL.
 */
class AIConversationService {
  /**
   * Create a new persistent conversation for an authenticated user.
   */
  async createConversation(userId, title = "New Grocery Plan") {
    if (!userId) {
      throw new Error("userId is mandatory to create a conversation");
    }

    const conversation = await prisma.chatConversation.create({
      data: {
        userId,
        title: title ? title.trim().slice(0, 100) : "New Grocery Plan",
        status: "active",
        lastMessageAt: new Date(),
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return conversation;
  }

  /**
   * List conversations for an authenticated user with pagination and search.
   */
  async getConversations(userId, { status = "active", search = "", page = 1, limit = 20 } = {}) {
    if (!userId) throw new Error("userId is required");

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        {
          messages: {
            some: {
              content: { contains: search.trim(), mode: "insensitive" },
            },
          },
        },
      ];
    }

    const [total, conversations] = await Promise.all([
      prisma.chatConversation.count({ where }),
      prisma.chatConversation.findMany({
        where,
        orderBy: { lastMessageAt: "desc" },
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { messages: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return {
      conversations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get single conversation with verified ownership.
   */
  async getConversation(userId, conversationId) {
    if (!userId || !conversationId) throw new Error("userId and conversationId are required");

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        summaries: {
          orderBy: { version: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!conversation) {
      const err = new Error("Conversation not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    return conversation;
  }

  /**
   * Update conversation title or status (e.g. archive/active).
   */
  async updateConversation(userId, conversationId, { title, status }) {
    await this.getConversation(userId, conversationId); // Verify ownership

    const data = {};
    if (title !== undefined) data.title = title.trim().slice(0, 100);
    if (status !== undefined) data.status = status;

    return await prisma.chatConversation.update({
      where: { id: conversationId },
      data,
    });
  }

  /**
   * Delete conversation permanently (cascades messages & summaries in PostgreSQL).
   */
  async deleteConversation(userId, conversationId) {
    await this.getConversation(userId, conversationId); // Verify ownership

    return await prisma.chatConversation.delete({
      where: { id: conversationId },
    });
  }

  /**
   * Save a chat message to a conversation.
   */
  async saveMessage(conversationId, userId, { role, content, messageType = "text", metadata = null }) {
    if (!conversationId || !userId || !role || !content) {
      throw new Error("Missing required parameters for saveMessage");
    }

    // Verify conversation ownership
    await this.getConversation(userId, conversationId);

    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId,
          userId,
          role,
          content,
          messageType,
          metadata: metadata || undefined,
        },
      }),
      prisma.chatConversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    // Automatically auto-title if conversation is still default title and user sends first message
    if (role === "user") {
      this.maybeAutoTitleConversation(conversationId, content).catch((err) =>
        console.error("Auto-title error:", err.message)
      );
    }

    return message;
  }

  /**
   * Retrieve messages for a conversation with pagination.
   */
  async getMessages(conversationId, userId, { limit = 50, beforeId = null } = {}) {
    await this.getConversation(userId, conversationId); // Verify ownership

    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

    const where = {
      conversationId,
      userId,
    };

    if (beforeId) {
      const beforeMessage = await prisma.chatMessage.findUnique({
        where: { id: beforeId },
        select: { createdAt: true },
      });
      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: limitNum,
    });

    const totalCount = await prisma.chatMessage.count({
      where: { conversationId, userId },
    });

    return {
      messages,
      totalCount,
    };
  }

  /**
   * Helper to generate a concise title from the user's initial prompt if title is default.
   */
  async maybeAutoTitleConversation(conversationId, userText) {
    const conv = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      select: { title: true },
    });

    if (conv && (conv.title === "New Grocery Plan" || conv.title.startsWith("New Conversation"))) {
      let cleanTitle = userText
        .replace(/^(i need|i want|please plan|plan for|groceries for)\s+/i, "")
        .trim();
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      if (cleanTitle.length > 36) {
        cleanTitle = cleanTitle.slice(0, 33) + "...";
      }
      if (cleanTitle.length > 2) {
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { title: cleanTitle },
        });
      }
    }
  }

  /**
   * Get active summary for conversation if available.
   */
  async getLatestSummary(conversationId, userId) {
    return await prisma.conversationSummary.findFirst({
      where: { conversationId, userId },
      orderBy: { version: "desc" },
    });
  }

  /**
   * Update or create conversation summary.
   */
  async saveSummary(conversationId, userId, summaryText, coveredMessageCount = 0) {
    const existing = await this.getLatestSummary(conversationId, userId);
    const nextVersion = existing ? existing.version + 1 : 1;

    return await prisma.conversationSummary.create({
      data: {
        conversationId,
        userId,
        summary: summaryText,
        coveredMessageCount,
        version: nextVersion,
      },
    });
  }
}

export default new AIConversationService();

