import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Divider,
  useTheme,
  Avatar,
  Paper,
  TextField,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useSelector } from "react-redux";

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const messageBoxRef = useRef(null);

  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  useEffect(() => {
    const fetchChatUsers = async () => {
      const res = await fetch("http://localhost:3001/chat/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    };
    fetchChatUsers();
  }, []);

  const fetchMessages = async (userId) => {
    const res = await fetch(`http://localhost:3001/chat/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data);
    setSelectedUser(users.find((u) => u._id === userId));
    setTimeout(() => {
      if (messageBoxRef.current) {
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const res = await fetch("http://localhost:3001/chat/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: selectedUser._id,
        content: newMessage,
      }),
    });

    const data = await res.json();
    setMessages([...messages, data]);
    setNewMessage("");

    setTimeout(() => {
      if (messageBoxRef.current) {
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <Box height="90vh" p={2} display="flex" flexDirection="column" gap={2}>
      {/* Top User List */}
      <Paper elevation={3} sx={{ height: 100, overflowX: "auto", p: 1 }}>
        <Typography variant="h6" px={1}>
          Chats
        </Typography>
        <Divider />
        <Box
          display="flex"
          gap={2}
          mt={1}
          sx={{ overflowX: "auto", px: 1 }}
        >
          {users.map((user) => (
            <Box
              key={user._id}
              onClick={() => fetchMessages(user._id)}
              sx={{
                cursor: "pointer",
                textAlign: "center",
                width: 80,
                minWidth: 80,
              }}
            >
              <Avatar
                src={`http://localhost:3001/assets/${user.picturePath}`}
                sx={{ margin: "auto", width: 48, height: 48 }}
              />
              <Typography variant="caption" noWrap>
                {user.firstName}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Bottom Chat Section */}
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedUser ? (
          <>
            <Typography variant="h6">
              Chat with {selectedUser.firstName} {selectedUser.lastName}
            </Typography>
            <Divider />
            <Box
              ref={messageBoxRef}
              flexGrow={1}
              overflow="auto"
              mt={2}
              pr={1}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  alignSelf={msg.isSender ? "flex-end" : "flex-start"}
                  bgcolor={msg.isSender ? palette.primary.light : medium}
                  borderRadius={2}
                  p={1.5}
                  m={1}
                  maxWidth="60%"
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Box>
              ))}
            </Box>
            <Divider />
            <Box display="flex" alignItems="center" mt={2}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <IconButton color="primary" onClick={sendMessage}>
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Typography
            variant="h6"
            color={medium}
            mt="auto"
            mb="auto"
            textAlign="center"
          >
            Select a user to start chatting
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ChatPage;
