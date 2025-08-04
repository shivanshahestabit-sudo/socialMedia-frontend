import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ChatHeader = ({ selectedUser, onClose, onlineUsers = [], BaseUrl }) => {
  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            color={isOnline ? "success" : "default"}
            invisible={!isOnline}
          >
            <Avatar
              src={
                selectedUser.picturePath
                  ? `${BaseUrl}/assets/${selectedUser.picturePath}`
                  : undefined
              }
              sx={{ width: 40, height: 40 }}
            >
              {!selectedUser.picturePath && selectedUser.firstName?.[0]}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {selectedUser.firstName} {selectedUser.lastName}
            </Typography>
            {/* <Typography variant="body2" color="text.secondary">
              {isOnline ? "Online" : "Offline"}
            </Typography> */}
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
    </Box>
  );
};

export default ChatHeader;
