import { useRef, useState, useEffect } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [text, setText] = useState("");
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    try {
      await onSendMessage({
        text: text.trim(),
      });

      setText("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <Box p={2}>
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
            disabled={!text.trim() || disabled}
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