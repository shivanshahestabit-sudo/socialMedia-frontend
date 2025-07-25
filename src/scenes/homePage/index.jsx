import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import ProtectedRoute from "protection/protectedRoutes";
import ChatWidget from "scenes/widgets/ChatWidget";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);

  return (
    <ProtectedRoute>
      <Box>
        <Navbar />
        <Box
          width="100%"
          padding="2rem 6%"
          display={isNonMobileScreens ? "flex" : "block"}
          gap="0.5rem"
          justifyContent="center"
          minHeight="calc(100vh - 80px)"
        >
          <Box flexBasis={isNonMobileScreens ? "15%" : undefined}>
            <UserWidget userId={_id} picturePath={picturePath} />
          </Box>
          <Box
            flexBasis={isNonMobileScreens ? "55%" : undefined}
            mt={isNonMobileScreens ? undefined : "2rem"}
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: isNonMobileScreens ? "calc(100vh - 120px)" : "auto",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <MyPostWidget picturePath={picturePath} />
              <PostsWidget userId={_id} />
            </Box>
          </Box>
          <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
            <ChatWidget userId={_id} picturePath={picturePath} />
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default HomePage;