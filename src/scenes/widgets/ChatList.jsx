import { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Badge,
} from "@mui/material";

const ChatUsersList = ({
  token,
  BaseUrl,
  onSelectUser,
  selectedUser,
  onlineUsers = [],
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchChatUsers = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`${BaseUrl}/chat/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch chat users");
        }

        const data = await res.json();

        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          setUsers(data);
        } else {
          console.error("Unexpected response format:", data);
          setUsers([]);
          setFetchError("Unexpected server response");
        }
      } catch (error) {
        console.error("Error fetching chat users:", error);
        setUsers([]);
        setFetchError(error.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchChatUsers();
  }, [token, BaseUrl]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box mt={2} px={1}>
        <Alert severity="error">{fetchError}</Alert>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box mt={2} px={1}>
        <Alert severity="info">No users available for chat.</Alert>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      gap={2}
      mt={1}
      sx={{
        overflowX: "auto",
        px: 1,
        pb: 1,
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": {
          height: 6,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#ccc",
          borderRadius: 4,
        },
      }}
    >
      {users.map((user) => (
        <Box
          key={user._id}
          onClick={() => onSelectUser(user)}
          sx={{
            cursor: "pointer",
            textAlign: "center",
            width: 80,
            minWidth: 80,
            p: 1,
            borderRadius: 2,
            backgroundColor:
              selectedUser?._id === user._id
                ? "action.selected"
                : "transparent",
            "&:hover": {
              backgroundColor: "action.hover",
            },
            transition: "background-color 0.2s",
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            color={onlineUsers.includes(user._id) ? "success" : "default"}
            invisible={!onlineUsers.includes(user._id)}
          >
            <Avatar
              src={
                user.picturePath
                  ? `${BaseUrl}/assets/${user.picturePath}`
                  : undefined
              }
              sx={{ margin: "auto", width: 48, height: 48 }}
            >
              {!user.picturePath && user.firstName?.[0]}
            </Avatar>
          </Badge>
          <Typography variant="caption" noWrap sx={{ mt: 0.5 }}>
            {user.firstName}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ChatUsersList;
