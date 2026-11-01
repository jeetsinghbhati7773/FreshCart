import prisma from "../config/prisma.js";

// Get all users in a chat
export const getAllUsersInChat = async (req, res) => {
  try {
    // Get distinct sender IDs from messages
    const distinctSenders = await prisma.message.findMany({
      select: { senderId: true },
      distinct: ["senderId"],
    });

    const userIds = distinctSenders.map((m) => m.senderId);

    // Fetch user details for those IDs
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ error: "Failed to fetch chat users" });
  }
};

// Save a new message
export const sendMessage = async (req, res) => {
  const { senderId, message, fromSeller } = req.body;

  if (!senderId || !message) {
    return res.status(400).json({ error: "senderId and message are required" });
  }

  try {
    const newMsg = await prisma.message.create({
      data: {
        senderId,
        message,
        fromSeller: Boolean(fromSeller),
        // Set unread status - only user messages are unread for seller
        isUnreadForSeller: !fromSeller,
      },
    });

    res.status(201).json(newMsg);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
};

// Fetch chat with one user
export const getMessages = async (req, res) => {
  const { senderId } = req.params;

  if (!senderId) {
    return res.status(400).json({ error: "senderId is required in URL" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { senderId },
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Get unread status for all users
export const getUnreadStatus = async (req, res) => {
  try {
    const unreadMessages = await prisma.message.groupBy({
      by: ["senderId"],
      where: {
        fromSeller: false,
        isUnreadForSeller: true,
      },
      _count: {
        id: true,
      },
    });

    const unreadMap = unreadMessages.reduce((map, item) => {
      map[item.senderId] = true;
      return map;
    }, {});

    res.status(200).json(unreadMap);
  } catch (error) {
    console.error("Error getting unread status:", error);
    res.status(500).json({
      error: "Failed to get unread status",
      details: error.message,
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;

    await prisma.message.updateMany({
      where: {
        senderId: userId,
        fromSeller: false,
        isUnreadForSeller: true,
      },
      data: {
        isUnreadForSeller: false,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
