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
} from "@mui/material";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  Favorite,
  Send,
  ShareOutlined,
} from "@mui/icons-material";
import WidgetWrapper from "components/WidgetWrapper";
import Friend from "components/Friend";
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
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

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

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAddComment();
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
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

        <IconButton>
          <ShareOutlined />
        </IconButton>
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
    </WidgetWrapper>
  );
};

export default PostWidget;