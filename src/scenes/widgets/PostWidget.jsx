import { useState, useMemo } from "react";
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
  EditOutlined,
} from "@mui/icons-material";
import WidgetWrapper from "components/WidgetWrapper";
import FlexBetween from "components/FlexBetween";
import React from "react";

const PostWidget = React.memo(
  ({
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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedDescription, setEditedDescription] = useState(description);
    const [editedPicturePath, setEditedPicturePath] = useState(picturePath);

    const dispatch = useDispatch();
    const token = useSelector((state) => state.token);
    const loggedInUserId = useSelector((state) => state.user._id);

    const { palette } = useTheme();
    const main = palette.neutral.main;
    const primary = palette.primary.main;
    const isLiked = useMemo(
      () => Boolean(likes[loggedInUserId]),
      [likes, loggedInUserId]
    );
    const likeCount = useMemo(() => Object.keys(likes).length, [likes]);
    const isOwner = useMemo(
      () => postUserId === loggedInUserId,
      [postUserId, loggedInUserId]
    );

    const patchLike = async () => {
      const response = await fetch(
        `http://localhost:3001/posts/${postId}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: loggedInUserId }),
        }
      );
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    };

    const handleAddComment = async () => {
      if (!comment.trim()) return;

      try {
        const response = await fetch(
          `http://localhost:3001/posts/${postId}/comment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: loggedInUserId,
              comment: comment.trim(),
            }),
          }
        );

        if (response.ok) {
          const updatedPost = await response.json();
          dispatch(setPost({ post: updatedPost }));
          setComment("");
          refreshPosts?.();
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
          setDeleteDialogOpen(false);
          refreshPosts?.();
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

    const handleEditPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/posts/${postId}/${loggedInUserId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              description: editedDescription,
              picturePath: editedPicturePath,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          dispatch(setPost({ post: data.post }));
          refreshPosts?.();
          setEditDialogOpen(false);
        } else {
          console.error("Error updating post:", data.message);
        }
      } catch (err) {
        console.error("Failed to update post:", err.message);
      }
    };

    return (
      <WidgetWrapper m="2rem 0">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography color={main} sx={{ fontSize: "1.25rem" }}>
            {description}
          </Typography>

          {isOwner && (
            <IconButton
              onClick={() => setEditDialogOpen(true)}
              sx={{
                backgroundColor: "#00D5FA",
                color: "white",
                width: "40px",
                height: "40px",
                "&:hover": {
                  backgroundColor: "#00d4fad2",
                },
              }}
            >
              <EditOutlined />
            </IconButton>
          )}
        </Box>

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
                  color: comment.trim() ? primary : palette.neutral.medium,
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

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Post</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
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

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Post</DialogTitle>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleEditPost();
            }}
          >
            <DialogContent>
              <InputBase
                placeholder="Edit description"
                fullWidth
                multiline
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "8px",
                  marginTop: "10px",
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#00D5FA",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#00c3e6",
                  },
                }}
              >
                Save
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </WidgetWrapper>
    );
  }
);

export default PostWidget;
