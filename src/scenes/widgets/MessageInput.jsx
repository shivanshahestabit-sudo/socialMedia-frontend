import { useRef, useState, useEffect } from "react";
import { Box, TextField, IconButton, Paper, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (onTyping) {
      if (!isTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    try {
      await onSendMessage({
        text: text.trim(),
        image: imagePreview,
        imageFile: imageFile,
      });

      setText("");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <Box p={2}>
      {imagePreview && (
        <Paper
          elevation={1}
          sx={{
            p: 1,
            mb: 2,
            display: "inline-block",
            position: "relative",
            maxWidth: 200,
          }}
        >
          <Box position="relative">
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "100%",
                height: 80,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <IconButton
              onClick={removeImage}
              size="small"
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                backgroundColor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  backgroundColor: "background.paper",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Image ready to send
          </Typography>
        </Paper>
      )}

      <Box component="form" onSubmit={handleSendMessage}>
        <Box display="flex" alignItems="flex-end" gap={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={disabled}
            variant="outlined"
            size="small"
          />

          <IconButton
            type="submit"
            color="primary"
            disabled={(!text.trim() && !imagePreview) || disabled}
            title="Send message"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageInput;
