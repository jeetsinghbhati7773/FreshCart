let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    //console.log("🟢 Socket connected:", socket.id);

    // Join room: seller joins "seller" room, users join their userId room
    socket.on("join", (roomId) => {
      socket.join(roomId);
      //console.log(`👤 Socket ${socket.id} joined room: ${roomId}`);

      // Special handling for seller
      if (roomId === "seller") {
        socket.join("seller");
        //console.log("🛒 Seller joined seller room");
      }
    });

    // Leave room
    socket.on("leave", (roomId) => {
      socket.leave(roomId);
      //console.log(`👤 Socket ${socket.id} left room: ${roomId}`);
    });

    // Receive and forward message
    socket.on("sendMessage", (data) => {
      const { senderId, message, fromSeller } = data;

      //console.log("📨 Socket received message:", data);

      // Forward to correct recipient
      if (fromSeller) {
        // Seller sending to a specific user
        //console.log(`📤 Seller sending to user ${senderId}`);

        // Send to the user's room
        io.to(senderId).emit("receiveMessage", data);

        // Also send to the specific chat room if it exists
        const chatRoom = `chat_${senderId}`;
        io.to(chatRoom).emit("receiveMessage", data);
      } else {
        // User sending to seller
        //console.log(`📤 User ${senderId} sending to seller`);

        // Send to seller room
        io.to("seller").emit("receiveMessage", data);

        // Send to specific chat room
        const chatRoom = `chat_${senderId}`;
        io.to(chatRoom).emit("receiveMessage", data);

        // Also send back to the user who sent it (for UI consistency)
        io.to(senderId).emit("receiveMessage", data);
      }
    });

    socket.on("disconnect", () => {
      //console.log("🔌 Socket disconnected:", socket.id);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });
};
