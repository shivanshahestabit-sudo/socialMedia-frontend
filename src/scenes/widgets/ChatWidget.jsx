import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Divider,
  useTheme,
  Avatar,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSelector } from "react-redux";
import BaseUrl from "apis/baseUrl";
import ChatUsersList from "./ChatList";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useSocket } from "../../context/SocketContext";

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const currentUser = useSelector((state) => state.user);
  const messageBoxRef = useRef(null);

  const {
    onlineUsers,
    typing,
    chatNotification,
    sendMessage: socketSendMessage,
    emitTyping,
    markMessagesRead,
    clearChatNotification,
  } = useSocket();

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messageBoxRef.current) {
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  useEffect(() => {
    const handleSocketMessage = (event) => {
      const message = event.detail;
      if (
        selectedUser &&
        (message.senderId === selectedUser._id ||
          message.receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleSocketMessageSent = (event) => {
      const message = event.detail;
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === message._id);
        if (!exists) {
          return [...prev, message];
        }
        return prev;
      });
      scrollToBottom();
    };

    window.addEventListener("socketMessage", handleSocketMessage);
    window.addEventListener("socketMessageSent", handleSocketMessageSent);

    return () => {
      window.removeEventListener("socketMessage", handleSocketMessage);
      window.removeEventListener("socketMessageSent", handleSocketMessageSent);
    };
  }, [selectedUser]);

  const fetchMessages = async (userId) => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(`${BaseUrl}/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        scrollToBottom();

        markMessagesRead(userId);
      } else {
        console.error("Failed to fetch messages");
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages([]);
    fetchMessages(user._id);
  };

  const sendMessage = async (messageData) => {
    if (!selectedUser || (!messageData.text && !messageData.image)) return;

    try {
      socketSendMessage({
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        content: messageData.text,
        text: messageData.text,
        image: messageData.image,
      });

      const formData = new FormData();
      formData.append("receiverId", selectedUser._id);

      if (messageData.text) {
        formData.append("content", messageData.text);
      }

      if (messageData.imageFile) {
        formData.append("image", messageData.imageFile);
      } else if (messageData.image) {
        formData.append("imageData", messageData.image);
      }

      const res = await fetch(`${BaseUrl}/chat/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to send message via HTTP");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (isTyping) => {
    if (selectedUser) {
      emitTyping({
        receiverId: selectedUser._id,
        isTyping,
      });
    }
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const handleCloseNotification = () => {
    clearChatNotification();
  };

  return (
    <Box height="90vh" display="flex" flexDirection="column" gap={2}>
      <Paper elevation={3} sx={{ height: 200, overflowX: "auto", p: 1 }}>
        <Typography variant="h3" px={2} marginBottom={1} marginTop={1}>
          Users to Chat With
        </Typography>
        <Divider />
        <Box>
          <ChatUsersList
            token={token}
            BaseUrl={BaseUrl}
            onSelectUser={handleSelectUser}
            selectedUser={selectedUser}
            onlineUsers={onlineUsers}
          />
        </Box>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedUser ? (
          <>
            <ChatHeader
              selectedUser={selectedUser}
              onClose={handleCloseChat}
              onlineUsers={onlineUsers}
              BaseUrl={BaseUrl}
            />

            <Box
              ref={messageBoxRef}
              flexGrow={1}
              overflow="auto"
              p={2}
              sx={{
                backgroundColor: palette.background.default,
              }}
            >
              {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                  <CircularProgress />
                </Box>
              ) : messages.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <Typography color="text.secondary">
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={1}>
                  {messages.map((msg, index) => {
                    const isOwn = msg.senderId === currentUser._id;
                    const showAvatar =
                      index === 0 ||
                      messages[index - 1].senderId !== msg.senderId;

                    return (
                      <Box
                        key={msg._id || index}
                        display="flex"
                        flexDirection={isOwn ? "row-reverse" : "row"}
                        alignItems="flex-end"
                        gap={1}
                        mb={1}
                      >
                        {!isOwn && (
                          <Avatar
                            src={
                              selectedUser.picturePath
                                ? `${BaseUrl}/assets/${selectedUser.picturePath}`
                                : undefined
                            }
                            sx={{
                              width: 32,
                              height: 32,
                              visibility: showAvatar ? "visible" : "hidden",
                            }}
                          >
                            {!selectedUser.picturePath &&
                              selectedUser.firstName?.[0]}
                          </Avatar>
                        )}

                        <Box
                          maxWidth="60%"
                          bgcolor={isOwn ? palette.primary.main : "brown"}
                          color={isOwn ? "white" : "text.primary"}
                          borderRadius={2}
                          p={1.5}
                          sx={{
                            wordBreak: "break-word",
                            borderBottomLeftRadius:
                              !isOwn && showAvatar ? 4 : 16,
                            borderBottomRightRadius:
                              isOwn && showAvatar ? 4 : 16,
                          }}
                        >
                          {msg.image && (
                            <Box mb={msg.content ? 1 : 0}>
                              <img
                                src={msg.image}
                                alt="Message attachment"
                                style={{
                                  maxWidth: "200px",
                                  width: "100%",
                                  borderRadius: 8,
                                  display: "block",
                                }}
                              />
                            </Box>
                          )}

                          {(msg.content || msg.text) && (
                            <Typography variant="body2">
                              {msg.content || msg.text}
                            </Typography>
                          )}

                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              display: "block",
                              textAlign: isOwn ? "right" : "left",
                              mt: 0.5,
                            }}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </Typography>
                        </Box>

                        {isOwn && (
                          <Avatar
                            src={
                              currentUser.picturePath
                                ? `${BaseUrl}/assets/${currentUser.picturePath}`
                                : undefined
                            }
                            sx={{
                              width: 32,
                              height: 32,
                              visibility: showAvatar ? "visible" : "hidden",
                            }}
                          >
                            {!currentUser.picturePath &&
                              currentUser.firstName?.[0]}
                          </Avatar>
                        )}
                      </Box>
                    );
                  })}

                  {typing && typing === selectedUser._id && (
                    <Box display="flex" alignItems="center" gap={1} ml={5}>
                      <Avatar
                        src={
                          selectedUser.picturePath
                            ? `${BaseUrl}/assets/${selectedUser.picturePath}`
                            : undefined
                        }
                        sx={{ width: 24, height: 24 }}
                      >
                        {!selectedUser.picturePath &&
                          selectedUser.firstName?.[0]}
                      </Avatar>
                      <Box
                        bgcolor="Purple"
                        borderRadius={2}
                        p={1}
                        sx={{ minWidth: 60 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          typing...
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Divider />
            <MessageInput
              onSendMessage={sendMessage}
              onTyping={handleTyping}
              disabled={loading}
            />
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
          >
            <Typography variant="h6" color="text.secondary" textAlign="center">
              Select a user to start chatting
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={!!chatNotification}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={chatNotification?.type === "error" ? "error" : "info"}
          sx={{ width: "100%" }}
        >
          {chatNotification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatPage;
