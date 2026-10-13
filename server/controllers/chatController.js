import Message from "../models/Message.js";
import User from "../models/user.js";

// Get all users in a chat
export const getAllUsersInChat = async (req, res) => {
  try {
    // Get distinct user IDs from the Message collection
    const userIds = await Message.distinct("senderId");

    // Fetch user details for those IDs
    const users = await User.find({ _id: { $in: userIds } })
      .select("-password")
      .sort({ createdAt: -1 });

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
    const newMsg = new Message({
      senderId,
      message,
      fromSeller,
      // Set unread status correctly - only user messages are unread for seller
      isUnreadForSeller: !fromSeller,
    });

    await newMsg.save();
    //console.log("💾 Message saved to DB:", newMsg);
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
    const messages = await Message.find({ senderId }).sort("createdAt");
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Get unread status for all users
export const getUnreadStatus = async (req, res) => {
  try {
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          fromSeller: false,
          isUnreadForSeller: true,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = unreadMessages.reduce((map, { _id }) => {
      map[_id.toString()] = true;
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

    await Message.updateMany(
      { senderId: userId, fromSeller: false, isUnreadForSeller: true },
      { $set: { isUnreadForSeller: false } }
    );

    //console.log(`✅ Marked messages as read for user ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
