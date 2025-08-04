import BaseUrl from "apis/baseUrl";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(null);
  const [chatNotification, setChatNotification] = useState(null);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      const newSocket = io(BaseUrl, {
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
        newSocket.emit("join", user._id);
      });

      newSocket.on("joined", (data) => {
        console.log("Joined chat successfully:", data);
        setOnlineUsers(data.onlineUsers || []);
      });

      newSocket.on("users-online", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("receive-message", (message) => {
        const event = new CustomEvent("socketMessage", { detail: message });
        window.dispatchEvent(event);

        setChatNotification({
          type: "message",
          message: `New message from ${message.sender?.firstName || "Someone"}`,
        });
      });

      newSocket.on("message-sent", (message) => {
        const event = new CustomEvent("socketMessageSent", { detail: message });
        window.dispatchEvent(event);
      });

      newSocket.on("user-typing", ({ senderId, isTyping }) => {
        setTyping(isTyping ? senderId : null);

        if (isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setTyping(null);
          }, 3000);
        }
      });

      newSocket.on("new_notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        if (Notification.permission === "granted") {
          new Notification("Social Connect", {
            body: notification.message,
            icon: "/favicon.ico",
          });
        }
      });

      newSocket.on("receive-notification", (notificationData) => {
        setChatNotification({
          type: notificationData.type,
          message: notificationData.message,
        });
      });

      newSocket.on("messages-read", ({ readBy, timestamp }) => {
        console.log(`Messages read by ${readBy} at ${timestamp}`);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
        setChatNotification({
          type: "error",
          message: error.message || "Connection error",
        });
      });

      setSocket(newSocket);
      loadNotifications();

      return () => {
        if (newSocket) {
          newSocket.emit("leave");
          newSocket.disconnect();
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [user, token]);

  const loadNotifications = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${BaseUrl}/notifications/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${BaseUrl}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${BaseUrl}/notifications/user/${user._id}/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit("send-message", messageData);
    }
  };

  const emitTyping = (data) => {
    if (socket) {
      socket.emit("typing", data);
    }
  };

  const markMessagesRead = (senderId) => {
    if (socket) {
      socket.emit("mark-messages-read", { senderId });
    }
  };

  const clearChatNotification = () => {
    setChatNotification(null);
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    onlineUsers,
    typing,
    chatNotification,
    sendMessage,
    emitTyping,
    markMessagesRead,
    clearChatNotification,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
