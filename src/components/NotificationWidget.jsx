import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import { NotificationsOutlined, Circle } from "@mui/icons-material";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

const NotificationWidget = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const theme = useTheme();
  const navigate = useNavigate();

  console.log("notifications", notifications);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    navigate(`/post/${notification.postId}`);
    handleClose();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 350,
          },
        }}
      >
        <Box p={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                onClick={handleMarkAllRead}
                sx={{
                  cursor: "pointer",
                  color: theme.palette.primary.main,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Mark all as read
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="textSecondary">
              No notifications yet
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read
                  ? "transparent"
                  : theme.palette.action.hover,
                "&:hover": {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <Box display="flex" alignItems="flex-start" width="100%">
                {!notification.read && (
                  <Circle
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: 8,
                      mr: 1,
                      mt: 1,
                    }}
                  />
                )}
                <Box flex={1}>
                  <Typography
                    variant="body2"
                    fontWeight={notification.read ? "normal" : "bold"}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}

        {notifications.length > 10 && (
          <>
            <Divider />
            <MenuItem onClick={() => navigate("/notifications")}>
              <Typography variant="body2" color="primary">
                View all notifications
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationWidget;
