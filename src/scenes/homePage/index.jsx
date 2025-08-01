import React, { lazy, Suspense, useEffect, useState } from "react";
import { Box, useMediaQuery, Backdrop } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import ProtectedRoute from "protection/protectedRoutes";
import CustomLoader from "components/CustomLoader";

const UserWidget = lazy(() => import("scenes/widgets/UserWidget"));
const MyPostWidget = lazy(() => import("scenes/widgets/MyPostWidget"));
const PostsWidget = lazy(() => import("scenes/widgets/PostsWidget"));
const ChatWidget = lazy(() => import("scenes/widgets/ChatWidget"));
const AdminComponent = lazy(() => import("scenes/widgets/AdminWidget"));

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);
  const role = useSelector((state) => state.role);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const renderUserContent = () => (
    <Box
      width="100%"
      padding="2rem 6%"
      display={isNonMobileScreens ? "flex" : "block"}
      gap="2.5rem"
      justifyContent="center"
      minHeight="calc(100vh - 80px)"
    >
      <Suspense fallback={<></>}>
        <Box display="flex" flexDirection="column" gap="1rem" width="30%">
          <Box flexBasis={isNonMobileScreens ? "10%" : undefined}>
            <UserWidget userId={_id} picturePath={picturePath} />
          </Box>

          <Box flexBasis={isNonMobileScreens ? "25%" : undefined}>
            <ChatWidget userId={_id} picturePath={picturePath} />
          </Box>
        </Box>

        <Box
          flexBasis={isNonMobileScreens ? "75%" : undefined}
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
      </Suspense>
    </Box>
  );

  const renderAdminContent = () => (
    <Box
      width="100%"
      padding="2rem 6%"
      display="flex"
      justifyContent="center"
      minHeight="calc(100vh - 80px)"
    >
      <Suspense fallback={<></>}>
        <AdminComponent />
      </Suspense>
    </Box>
  );

  return (
    <ProtectedRoute>
      <Box>
        <Navbar />
        {role === "admin" ? renderAdminContent() : renderUserContent()}

        {loading && (
          <Backdrop
            sx={(theme) => ({
              color: "#fff",
              zIndex: theme.zIndex.drawer + 1,
            })}
            open={loading}
          >
            <CustomLoader />
          </Backdrop>
        )}
      </Box>
    </ProtectedRoute>
  );
};

export default HomePage;
