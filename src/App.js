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

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {isAuth && (
            <SocketProvider>
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/" element={<Navigate to="/home" />} />
              </Routes>
            </SocketProvider>
          )}
          {!isAuth && (
            <Routes>
              <Route path="/home" element={<LoginPage />} />
              <Route path="/" element={<LoginPage />} />
            </Routes>
          )}
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
