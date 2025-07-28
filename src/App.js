import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { SocketProvider } from "./context/SocketContext";
import { SnackbarProvider } from "./context/SnackbarContext";
import GlobalSnackbar from "./components/GlobalSnackbar";

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider>
            <GlobalSnackbar />

            {isAuth ? (
              <SocketProvider>
                <Routes>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/profile/:userId" element={<ProfilePage />} />
                  <Route path="/" element={<Navigate to="/home" />} />
                </Routes>
              </SocketProvider>
            ) : (
              <Routes>
                <Route path="/home" element={<LoginPage />} />
                <Route path="/" element={<LoginPage />} />
              </Routes>
            )}
          </SnackbarProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
