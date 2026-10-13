import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa";

const socket = io("https://hitman-grocery-backend.onrender.com", {
  withCredentials: true,
});

const SellerUserChats = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [unreadMap, setUnreadMap] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const chatEndRef = useRef(null);
  const selectedUserRef = useRef(null);
  const currentChatRoom = useRef(null);

  // Socket connection handlers
  useEffect(() => {
    const handleConnect = () => {
      //console.log("🟢 Seller socket connected");
      setIsConnected(true);

      // Join seller room when connected
      socket.emit("join", "seller");
      if (sellerId) {
        socket.emit("join", sellerId);
      }
    };

    const handleDisconnect = () => {
      //console.log("🔴 Seller socket disconnected");
      setIsConnected(false);
    };

    const handleError = (error) => {
      console.error("❌ Seller socket error:", error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
    };
  }, [sellerId]);

  // Single message handler that persists throughout component lifecycle
  useEffect(() => {
    const handleMessage = (msg) => {
      //console.log("📨 Seller received message:", msg);

      const selected = selectedUserRef.current;

      if (selected && msg.senderId === selected._id) {
        // Message is for currently selected user
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m._id === msg._id ||
              (m.message === msg.message &&
                m.senderId === msg.senderId &&
                m.fromSeller === msg.fromSeller &&
                Math.abs(
                  new Date(m.createdAt || new Date()) -
                    new Date(msg.createdAt || new Date())
                ) < 2000)
          );
          if (isDuplicate) return prev;
          return [...prev, msg];
        });
      } else if (!msg.fromSeller) {
        // Message from user, mark as unread if not currently selected
        setUnreadMap((prev) => ({ ...prev, [msg.senderId]: true }));
      }

      // Add new user to list if they don't exist
      if (!msg.fromSeller) {
        setUsers((prevUsers) => {
          const exists = prevUsers.some((u) => u._id === msg.senderId);
          if (!exists) {
            return [
              ...prevUsers,
              {
                _id: msg.senderId,
                name: msg.senderName || "New User",
                email: msg.senderEmail || "",
              },
            ];
          }
          return prevUsers;
        });
      }
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, []); // Empty dependency array - this handler should persist

  // Fetch seller info and setup socket
  useEffect(() => {
    const connectAndJoin = async () => {
      try {
        const res = await axios.get(
          `https://hitman-grocery-backend.onrender.com/api/users/me`,
          {
            withCredentials: true,
          }
        );

        const sellerUserId = res.data._id;
        setSellerId(sellerUserId);

        // Join seller room and seller's user ID room
        socket.emit("join", "seller");
        socket.emit("join", sellerUserId);

        //console.log("🛒 Seller joined rooms: seller, " + sellerUserId);
      } catch (err) {
        console.error("❌ Failed to fetch seller info", err);
      }
    };

    connectAndJoin();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `https://hitman-grocery-backend.onrender.com/api/chat/all-users`,
          {
            withCredentials: true,
          }
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching user list", err);
      }
    };

    fetchUsers();
  }, []);

  // Fetch unread map from DB
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(
          `https://hitman-grocery-backend.onrender.com/api/chat/unread-status`,
          {
            withCredentials: true,
          }
        );
        setUnreadMap(res.data);
      } catch (err) {
        console.error("Error fetching unread map", err);
      }
    };

    fetchUnread();
  }, []);

  // Handle user selection and chat room management
  useEffect(() => {
    if (selectedUser?._id) {
      selectedUserRef.current = selectedUser;

      // Leave previous chat room if exists
      if (currentChatRoom.current) {
        socket.emit("leave", currentChatRoom.current);
        //console.log(`🚪 Seller left room: ${currentChatRoom.current}`);
      }

      // Join new chat room
      const chatRoom = `chat_${selectedUser._id}`;
      socket.emit("join", chatRoom);
      currentChatRoom.current = chatRoom;
      //console.log(`🚪 Seller joined room: ${chatRoom}`);

      const fetchMessages = async () => {
        try {
          const res = await axios.get(
            `https://hitman-grocery-backend.onrender.com/api/chat/${selectedUser._id}`,
            { withCredentials: true }
          );
          setMessages(res.data);

          // Mark messages as read
          await axios.post(
            `https://hitman-grocery-backend.onrender.com/api/chat/mark-read/${selectedUser._id}`,
            {},
            { withCredentials: true }
          );

          setUnreadMap((prev) => ({ ...prev, [selectedUser._id]: false }));
        } catch (err) {
          console.error("Error fetching messages", err);
        }
      };

      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const msgObj = {
      senderId: selectedUser._id,
      message,
      fromSeller: true,
      createdAt: new Date().toISOString(),
    };

    //console.log("📤 Seller sending message:", msgObj);

    socket.emit("sendMessage", msgObj);
    setMessages((prev) => [...prev, msgObj]);
    setMessage("");

    axios
      .post(
        `https://hitman-grocery-backend.onrender.com/api/chat/send`,
        msgObj,
        {
          withCredentials: true,
        }
      )
      .catch((err) => console.error("Failed to save message:", err));
  };

  const goBack = () => {
    // Leave current chat room when going back
    if (currentChatRoom.current) {
      socket.emit("leave", currentChatRoom.current);
      //console.log(`🚪 Seller left room: ${currentChatRoom.current}`);
      currentChatRoom.current = null;
    }

    setSelectedUser(null);
    selectedUserRef.current = null;
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (currentChatRoom.current) {
        socket.emit("leave", currentChatRoom.current);
        // console.log(
        //   `🚪 Seller left room on unmount: ${currentChatRoom.current}`
        // );
      }
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow h-[85vh] max-w-6xl mx-auto flex flex-col sm:flex-row gap-4">
      {/* User List */}
      <div
        className={`sm:w-1/3 w-full sm:block ${
          selectedUser ? "hidden sm:block" : "block"
        } overflow-y-auto border-r sm:pr-4`}
      >
        <h2 className="text-lg font-semibold mb-3 text-primary-dull flex items-center gap-2">
          User Chats
          {/* <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          ></span> */}
        </h2>
        {users.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No users have started a chat yet.
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className={`relative border border-gray-300 p-2 cursor-pointer rounded mb-2 flex items-center justify-between ${
                selectedUser?._id === user._id
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setSelectedUser(user);
                selectedUserRef.current = user;
              }}
            >
              <span>{user.name || user.email}</span>
              {unreadMap[user._id] && (
                <span className="ml-2 w-3 h-3 bg-red-600 rounded-full"></span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Section */}
      <div
        className={`flex-1 w-full sm:w-2/3 flex flex-col h-full ${
          selectedUser ? "block" : "hidden sm:block"
        }`}
      >
        {selectedUser && (
          <div className="sm:hidden flex items-center gap-2 mb-2">
            <button
              onClick={goBack}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <FaArrowLeft />
              Back to Users
            </button>
            <span className="text-primary-dull font-medium text-base">
              {selectedUser.name || selectedUser.email}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto border rounded p-3 space-y-2 text-sm max-h-[60vh] min-h-[400px]">
          {selectedUser ? (
            <div className="flex flex-col space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`flex ${
                    msg.fromSeller ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg break-words ${
                      msg.fromSeller
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.message}
                    <div className="text-xs opacity-70 mt-1">
                      {(() => {
                        const date = new Date(msg.createdAt || new Date());
                        const timeStr = date.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });
                        const day = date.getDate();
                        const monthStr = date.toLocaleString("default", {
                          month: "long",
                        });
                        const dayWithSuffix = `${day}${
                          ["th", "st", "nd", "rd"][
                            day % 100 > 10 && day % 100 < 20 ? 0 : day % 10
                          ] || "th"
                        }`;
                        return `${timeStr}, ${dayWithSuffix} ${monthStr}`;
                      })()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-10">
              Select a user to view messages
            </p>
          )}
        </div>

        {selectedUser && (
          <div className="mt-3 flex items-center gap-2 border-t pt-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dull transition-colors"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerUserChats;
