import React, { useEffect, useRef } from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import { useNavigate } from "react-router-dom";
import BaseUrl from "apis/baseUrl";

const GoogleLogin = ({
  onSuccess,
  onError,
  disabled = false,
  mode = "signin",
}) => {
  const googleButtonRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const initializeGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (googleButtonRef.current) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: theme.palette.mode === "dark" ? "filled_black" : "outline",
        size: "large",
        type: "standard",
        text: mode === "signin" ? "signin_with" : "signup_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "100%",
      });
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      console.log("Google Response:", response);

      if (response.credential) {
        const authPayload = {
          credential: {
            idToken: response.credential,
            accessToken: null,
            providerId: "google.com",
            signInMethod: "google.com",
          },
          email: null,
          signupMethod: "google",
          deviceType: "web",
        };

        console.log("Sending to backend:", authPayload);

        const result = await googleAuth(authPayload);

        if (result.success) {
          dispatch(
            setLogin({
              user: result.user,
              token: result.token,
            })
          );

          if (onSuccess) {
            onSuccess(result);
          } else {
            navigate("/home");
          }
        } else {
          if (onError) {
            onError(result.msg || "Google authentication failed");
          }
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      if (onError) {
        onError("Google authentication failed. Please try again.");
      }
    }
  };

  const googleAuth = async (payload) => {
    try {
      const response = await fetch(`${BaseUrl}/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          msg: result.msg || "Google authentication failed",
        };
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
        msg: result.msg,
      };
    } catch (error) {
      console.error("Google auth request failed:", error);
      return {
        success: false,
        msg: "Network error during Google authentication",
      };
    }
  };

  useEffect(() => {
    if (window.google && !disabled) {
      initializeGoogleSignIn();
    } else if (!disabled) {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, [disabled]);

  if (disabled) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Divider sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          or
        </Typography>
      </Divider>

      <Box
        ref={googleButtonRef}
        sx={{
          display: "flex",
          justifyContent: "center",
          "& > div": {
            width: "100% !important",
          },
        }}
      />

      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ mt: 1, display: "block", textAlign: "center" }}
      >
        Sign {mode === "signin" ? "in" : "up"} securely with your Google account
      </Typography>
    </Box>
  );
};

export default GoogleLogin;
