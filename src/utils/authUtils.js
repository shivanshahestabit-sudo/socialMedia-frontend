import { setLogout } from "state";

export const handleAuthError = (dispatch) => {
  try {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    } else if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.signOut().catch(console.error);
      }
    }

    dispatch(setLogout());
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    window.location.href = "/";
  } catch (error) {
    console.error("Auth error cleanup failed:", error);
    dispatch(setLogout());
    localStorage.clear();
    window.location.href = "/";
  }
};

export const authenticatedFetch = async (url, options = {}, dispatch) => {
  try {
    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();

        if (
          response.status === 401 ||
          (errorData.message &&
            (errorData.message.includes("JWT expired") ||
              errorData.message.includes("Invalid token") ||
              errorData.message.includes("Access Denied: No token provided") ||
              errorData.message.includes("Token Expired Error") ||
              errorData.message.includes("Json Web Token Error")))
        ) {
          console.warn("Authentication error detected, logging out user");
          handleAuthError(dispatch);
          throw new Error("Authentication failed");
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    if (isJson) {
      return await response.json();
    } else {
      return response;
    }
  } catch (error) {
    if (error.message === "Authentication failed") {
      throw error;
    }

    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("token")
    ) {
      console.warn("Potential authentication error, logging out user");
      handleAuthError(dispatch);
    }

    throw error;
  }
};

export const isAuthError = (error, response = null) => {
  if (response && response.status === 401) return true;

  if (error && error.message) {
    const authErrorMessages = [
      "JWT expired",
      "Invalid token",
      "Access Denied: No token provided",
      "Token Expired Error",
      "Json Web Token Error",
      "Authentication failed",
      "Unauthorized",
    ];

    return authErrorMessages.some((msg) =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  return false;
};
