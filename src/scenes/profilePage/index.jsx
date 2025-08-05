import { Box, useMediaQuery, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Navbar from "scenes/navbar";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import UserWidget from "scenes/widgets/UserWidget";
import ProtectedRoute from "protection/protectedRoutes";
import {
  authenticatedFetch,
  handleAuthError,
  isAuthError,
} from "utils/authUtils.js";
import BaseUrl from "apis/baseUrl";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const getUser = async () => {
    try {
      const response = await fetch(`${BaseUrl}/users/${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (
          response.status === 401 ||
          isAuthError({ message: errorData.message })
        ) {
          console.warn("Authentication error detected, logging out user");
          handleAuthError(dispatch);
          return;
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user", err);

      if (isAuthError(err)) {
        console.warn("Authentication error in catch block, logging out user");
        handleAuthError(dispatch);
        return;
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <Box>
        <Navbar />
        <Box width="100%" textAlign="center" mt="1rem" mb="-1rem">
          <Typography variant="h3" fontWeight="bold">
            My Page
          </Typography>
        </Box>

        <Box
          width="100%"
          padding="2rem 6%"
          display={isNonMobileScreens ? "flex" : "block"}
          gap="2rem"
          justifyContent="center"
        >
          <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
            <UserWidget userId={userId} picturePath={user.picturePath} />
            <Box m="2rem 0" />
          </Box>
          <Box
            flexBasis={isNonMobileScreens ? "42%" : undefined}
            mt={isNonMobileScreens ? undefined : "2rem"}
          >
            <MyPostWidget picturePath={user.picturePath} />
            <Box m="2rem 0" />
            <PostsWidget userId={userId} isProfile />
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default ProfilePage;
