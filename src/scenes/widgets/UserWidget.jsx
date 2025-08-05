import {
  LocationOnOutlined,
  WorkOutlineOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { Box, Typography, Divider, useTheme, IconButton } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import EditProfileDialog from "components/EditProfile";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setLogin } from "state"; // Import the setLogin action
import BaseUrl from "apis/baseUrl";

const UserWidget = ({ userId, picturePath }) => {
  const [user, setUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { palette } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUser = useSelector((state) => state.user);
  const role = useSelector((state) => state.role);
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;

  const getUser = async () => {
    try {
      const response = await fetch(`${BaseUrl}/users/${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    
    if (loggedInUser && updatedUser._id === loggedInUser._id) {
      dispatch(setLogin({
        user: updatedUser,
        token: token,
        role: role
      }));
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!user) return null;

  const { firstName, lastName, location: userLocation, occupation } = user;

  return (
    <WidgetWrapper>
      <FlexBetween
        gap="0.5rem"
        pb="1.1rem"
        onClick={() => navigate(`/profile/${userId}`)}
        justifyContent="center !important"
      >
        <FlexBetween gap={location.pathname !== "/home" ? "3rem" : "1rem"}>
          <UserImage image={picturePath} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{
                "&:hover": {
                  color: palette.primary.light,
                  cursor: "pointer",
                },
              }}
            >
              {firstName} {lastName}
            </Typography>
          </Box>
          {location.pathname !== "/home" && (
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
        </FlexBetween>
      </FlexBetween>

      <Divider />

      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{userLocation ? userLocation : "Unknown Location"}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{occupation ? occupation : "Unknown Occupation"}</Typography>
        </Box>
      </Box>

      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        user={user}
        token={token}
        setUser={updateUser} // Use the custom updateUser function
      />
    </WidgetWrapper>
  );
};

export default UserWidget;