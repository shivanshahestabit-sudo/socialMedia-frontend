import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  InputBase,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  Favorite,
  Send,
  DeleteOutlined,
} from "@mui/icons-material";
import WidgetWrapper from "components/WidgetWrapper";
import FlexBetween from "components/FlexBetween";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  refreshPosts,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [comment, setComment] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  // Check if the current user owns this post
  const isOwner = postUserId === loggedInUserId;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: loggedInUserId, 
          comment: comment.trim() 
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        dispatch(setPost({ post: updatedPost }));
        setComment("");
        
        if (refreshPosts) {
          refreshPosts();
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(`http://localhost:3001/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      });

      if (response.ok) {
        // Close the dialog
        setDeleteDialogOpen(false);
        
        // Refresh the posts list
        if (refreshPosts) {
          refreshPosts();
        }
      } else {
        const errorData = await response.json();
        console.error("Error deleting post:", errorData.message);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAddComment();
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Typography color={main} sx={{ mt: "0rem", fontSize: "1.25rem" }}>
        {description}
      </Typography>
      <FlexBetween mt="1rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <Favorite sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        {isOwner && (
          <IconButton
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              backgroundColor: "#ff4444",
              color: "white",
              width: "40px",
              height: "40px",
              "&:hover": {
                backgroundColor: "#cc0000",
              },
            }}
          >
            <DeleteOutlined />
          </IconButton>
        )}
      </FlexBetween>
      
      {isComments && (
        <Box mt="0.5rem">
          <FlexBetween gap="1rem" mb="1rem">
            <InputBase
              placeholder="Write a comment..."
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              onKeyPress={handleKeyPress}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 1rem",
              }}
            />
            <IconButton 
              onClick={handleAddComment}
              disabled={!comment.trim()}
              sx={{ 
                color: comment.trim() ? primary : palette.neutral.medium 
              }}
            >
              <Send />
            </IconButton>
          </FlexBetween>
        </Box>
      )}

      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box key={`${name}-${i}`} mb="0.5rem">
              <Divider />
              <Box p="0.5rem 0">
                <FlexBetween>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={primary}
                  >
                    {comment.firstName} {comment.lastName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={palette.neutral.medium}
                  >
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Typography>
                </FlexBetween>
                <Typography 
                  variant="body2" 
                  color={main}
                  sx={{ mt: "0.25rem" }}
                >
                  {comment.comment}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Post
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePost} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default PostWidget;