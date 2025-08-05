import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Divider, useTheme, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import { useNavigate } from "react-router-dom";
import BaseUrl from "apis/baseUrl";

const FacebookLogin = ({
  onSuccess,
  onError,
  disabled = false,
  mode = "signin",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const initializeFacebookSDK = () => {
    return new Promise((resolve) => {
      if (document.getElementById("facebook-jssdk")) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });

        setIsSDKLoaded(true);
        resolve();
      };

      document.body.appendChild(script);
    });
  };

  const checkLoginStatus = () => {
    return new Promise((resolve) => {
      window.FB.getLoginStatus((response) => {
        resolve(response);
      });
    });
  };

  const handleFacebookResponse = async (response) => {
    console.log("Facebook Response:", response);

    if (response.status === "connected") {
      try {
        const userInfo = await new Promise((resolve) => {
          window.FB.api(
            "/me",
            { fields: "name,email,first_name,last_name,picture" },
            (userResponse) => {
              resolve(userResponse);
            }
          );
        });

        console.log("Facebook User Info:", userInfo);

        const authPayload = {
          credential: {
            accessToken: response.authResponse.accessToken,
            userID: response.authResponse.userID,
            expiresIn: response.authResponse.expiresIn,
            signedRequest: response.authResponse.signedRequest,
            providerId: "facebook.com",
            signInMethod: "facebook.com",
          },
          userInfo: userInfo,
          email: userInfo.email,
          signupMethod: "facebook",
          deviceType: "web",
        };

        console.log("Sending to backend:", authPayload);

        const result = await facebookAuth(authPayload);

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
            onError(result.msg || "Facebook authentication failed");
          }
        }
      } catch (error) {
        console.error("Facebook login error:", error);
        if (onError) {
          onError("Facebook authentication failed. Please try again.");
        }
      }
    } else if (response.status === "not_authorized") {
      if (onError) {
        onError("Please authorize the app to continue with Facebook login.");
      }
    } else {
      if (onError) {
        onError("Facebook login was cancelled or failed.");
      }
    }
  };

  const facebookAuth = async (payload) => {
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
          msg: result.msg || "Facebook authentication failed",
        };
      }

      return {
        success: true,
        user: result.user,
        token: result.token,
        msg: result.msg,
      };
    } catch (error) {
      console.error("Facebook auth request failed:", error);
      return {
        success: false,
        msg: "Network error during Facebook authentication",
      };
    }
  };

  // Handle login button click
  const handleLogin = async () => {
    if (!isSDKLoaded) {
      if (onError) {
        onError("Facebook SDK not loaded. Please try again.");
      }
      return;
    }

    try {
      // Check current login status
      const statusResponse = await checkLoginStatus();

      if (statusResponse.status === "connected") {
        // User is already logged in
        await handleFacebookResponse(statusResponse);
      } else {
        // User needs to login
        window.FB.login(
          (loginResponse) => {
            handleFacebookResponse(loginResponse);
          },
          {
            scope: "email,public_profile",
            return_scopes: true,
          }
        );
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      if (onError) {
        onError("Facebook login failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (!disabled) {
      initializeFacebookSDK();
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

      <Button
        fullWidth
        variant="outlined"
        onClick={handleLogin}
        disabled={!isSDKLoaded}
        sx={{
          py: 1.5,
          px: 2,
          backgroundColor: "#1877F2",
          color: "white",
          border: "1px solid #1877F2",
          textTransform: "none",
          fontSize: "16px",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#166FE5",
            border: "1px solid #166FE5",
          },
          "&:disabled": {
            backgroundColor: "#E4E6EA",
            color: "#BCC0C4",
            border: "1px solid #E4E6EA",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {mode === "signin"
            ? "Sign in with Facebook"
            : "Sign up with Facebook"}
        </Box>
      </Button>

      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ mt: 1, display: "block", textAlign: "center" }}
      >
        Sign {mode === "signin" ? "in" : "up"} securely with your Facebook
        account
      </Typography>
    </Box>
  );
};

export default FacebookLogin;
