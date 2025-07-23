import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Form from "./Form";

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    if (user && token) {
      navigate("/home");
    }
  }, [user, token, navigate]);

  return (
    <Box>
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="1rem 6%"
        textAlign="center"
      >
        <Typography fontWeight="bold" fontSize="32px" color="primary">
          Social Connect
        </Typography>
      </Box>

      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor={theme.palette.background.alt}
      >
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
          Connect with the world, post what you like!
        </Typography>
        <Form />
      </Box>
    </Box>
  );
};

export default LoginPage;
