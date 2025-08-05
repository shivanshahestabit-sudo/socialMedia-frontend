import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";
import { Box, Typography, IconButton, useTheme, Tooltip } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import BaseUrl from "apis/baseUrl";
import { handleAuthError, isAuthError } from "utils/authUtils";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const postsPerPage = 10;

  const getPosts = async (page = 1, sort = sortOrder) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseUrl}/posts?page=${page}&limit=${postsPerPage}&sort=${sort}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || isAuthError({ message: data.message })) {
          handleAuthError(dispatch);
          return;
        }
        throw new Error(data.message);
      }

      if (Array.isArray(data.posts)) {
        dispatch(setPosts({ posts: data.posts }));
        setTotalPosts(data.totalPosts);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else if (Array.isArray(data)) {
        dispatch(setPosts({ posts: data }));
        setTotalPosts(data.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        dispatch(setPosts({ posts: [] }));
        setTotalPosts(0);
        setTotalPages(1);
        setCurrentPage(1);
        console.warn("Unexpected post data format", data);
      }
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError(dispatch);
      } else {
        console.error("Error fetching posts:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserPosts = async (page = 1, sort = sortOrder) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseUrl}/posts/${userId}/posts?page=${page}&limit=${postsPerPage}&sort=${sort}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || isAuthError({ message: data.message })) {
          handleAuthError(dispatch);
          return;
        }
        throw new Error(data.message);
      }

      if (data.posts) {
        dispatch(setPosts({ posts: data.posts }));
        setTotalPosts(data.totalPosts);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        dispatch(setPosts({ posts: data }));
        setTotalPosts(data.length);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthError(dispatch);
      } else {
        console.error("Error fetching user posts:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts(1, sortOrder);
    } else {
      getPosts(1, sortOrder);
    }
  }, []);

  const refreshPosts = () => {
    if (isProfile) {
      getUserPosts(currentPage, sortOrder);
    } else {
      getPosts(currentPage, sortOrder);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      if (isProfile) {
        getUserPosts(newPage, sortOrder);
      } else {
        getPosts(newPage, sortOrder);
      }
    }
  };

  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
    setCurrentPage(1);
    if (isProfile) {
      getUserPosts(1, newSort);
    } else {
      getPosts(1, newSort);
    }
  };
  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2,
          px: 1,
          mt: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.neutral.medium,
            fontSize: "1.05rem",
            mr: 1,
          }}
        >
          Sort by:
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.background.alt,
            borderRadius: "20px",
            padding: "2px",
            border: `1px solid ${theme.palette.neutral.light}`,
          }}
        >
          <Tooltip title="Newest First" arrow>
            <IconButton
              onClick={() => handleSortChange("newest")}
              disabled={loading}
              sx={{
                width: 32,
                height: 32,
                color:
                  sortOrder === "newest"
                    ? theme.palette.background.paper
                    : theme.palette.neutral.medium,
                backgroundColor:
                  sortOrder === "newest"
                    ? theme.palette.primary.main
                    : "transparent",
                "&:hover": {
                  backgroundColor:
                    sortOrder === "newest"
                      ? theme.palette.primary.dark
                      : theme.palette.neutral.light,
                  color:
                    sortOrder === "newest"
                      ? theme.palette.background.paper
                      : theme.palette.primary.main,
                },
                "&:disabled": {
                  color: theme.palette.neutral.light,
                },
                transition: "all 0.2s ease",
                mr: 0.5,
              }}
            >
              <ArrowDownward fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Oldest First" arrow>
            <IconButton
              onClick={() => handleSortChange("oldest")}
              disabled={loading}
              sx={{
                width: 32,
                height: 32,
                color:
                  sortOrder === "oldest"
                    ? theme.palette.background.paper
                    : theme.palette.neutral.medium,
                backgroundColor:
                  sortOrder === "oldest"
                    ? theme.palette.primary.main
                    : "transparent",
                "&:hover": {
                  backgroundColor:
                    sortOrder === "oldest"
                      ? theme.palette.primary.dark
                      : theme.palette.neutral.light,
                  color:
                    sortOrder === "oldest"
                      ? theme.palette.background.paper
                      : theme.palette.primary.main,
                },
                "&:disabled": {
                  color: theme.palette.neutral.light,
                },
                transition: "all 0.2s ease",
              }}
            >
              <ArrowUpward fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.3s" }}>
        {posts.map(
          ({
            _id,
            userId,
            firstName,
            lastName,
            description,
            location,
            picturePath,
            userPicturePath,
            likes,
            comments,
          }) => (
            <PostWidget
              key={_id}
              postId={_id}
              postUserId={userId}
              name={`${firstName} ${lastName}`}
              description={description}
              location={location}
              picturePath={picturePath}
              userPicturePath={userPicturePath}
              likes={likes}
              comments={comments}
              refreshPosts={refreshPosts}
            />
          )
        )}
      </Box>

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            px: 2,
            py: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.neutral.medium,
              fontSize: "0.85rem",
            }}
          >
            Total Posts: {totalPosts}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: theme.palette.background.alt,
              borderRadius: "25px",
              padding: "4px 8px",
              border: `1px solid ${theme.palette.neutral.light}`,
            }}
          >
            <IconButton
              onClick={handlePrevious}
              disabled={currentPage === 1 || loading}
              sx={{
                width: 32,
                height: 32,
                color:
                  currentPage === 1
                    ? theme.palette.neutral.light
                    : theme.palette.primary.main,
                backgroundColor:
                  currentPage === 1
                    ? "transparent"
                    : theme.palette.background.paper,
                "&:hover": {
                  backgroundColor:
                    currentPage === 1
                      ? "transparent"
                      : theme.palette.primary.light,
                  color:
                    currentPage === 1
                      ? theme.palette.neutral.light
                      : theme.palette.primary.dark,
                },
                "&:disabled": {
                  color: theme.palette.neutral.light,
                },
                transition: "all 0.2s ease",
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>

            <Box
              sx={{
                minWidth: 40,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.paper,
                borderRadius: "16px",
                fontWeight: 600,
                fontSize: "0.9rem",
                px: 2,
              }}
            >
              {currentPage}
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: theme.palette.neutral.medium,
                fontSize: "0.8rem",
                mx: 1,
              }}
            >
              of {totalPages}
            </Typography>

            <IconButton
              onClick={handleNext}
              disabled={currentPage === totalPages || loading}
              sx={{
                width: 32,
                height: 32,
                color:
                  currentPage === totalPages
                    ? theme.palette.neutral.light
                    : theme.palette.primary.main,
                backgroundColor:
                  currentPage === totalPages
                    ? "transparent"
                    : theme.palette.background.paper,
                "&:hover": {
                  backgroundColor:
                    currentPage === totalPages
                      ? "transparent"
                      : theme.palette.primary.light,
                  color:
                    currentPage === totalPages
                      ? theme.palette.neutral.light
                      : theme.palette.primary.dark,
                },
                "&:disabled": {
                  color: theme.palette.neutral.light,
                },
                transition: "all 0.2s ease",
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ width: "120px" }} />
        </Box>
      )}
    </Box>
  );
};

export default PostsWidget;
