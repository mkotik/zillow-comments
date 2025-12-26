import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link as RouterLink,
} from "react-router-dom";
import "./App.scss";
import CommentPage from "./CommentPage";
import BasePage from "./BasePage";
import LoginPage from "./LoginPage";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CssBaseline, Link as MuiLink, Typography } from "@mui/material";
import theme from "./theme";
import ProtectedRoute from "./ProtectedRoute";
import { useZillowUrlState } from "./hooks/useZillowUrlState";
import SettingsPage from "./SettingsPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";

function App() {
  const zillowUrlState = useZillowUrlState();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <div className="App-main">
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Public route */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

              <Route
                path="/comments"
                element={
                  <ProtectedRoute>
                    <CommentPage zillowUrlState={zillowUrlState} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homedetails/*"
                element={<Navigate to="/comments" replace />}
              />
              <Route
                path="/b/*"
                element={<Navigate to="/comments" replace />}
              />
              <Route path="/*" element={<Navigate to="/comments" replace />} />
            </Routes>
          </div>

          <footer className="App-footer">
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                py: 2,
              }}
            >
              <MuiLink
                component={RouterLink}
                to="/privacy-policy"
                underline="hover"
              >
                Privacy Policy
              </MuiLink>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                © {new Date().getFullYear()}
              </Typography>
            </Box>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
