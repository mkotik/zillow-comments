import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.scss";
import CommentPage from "./CommentPage";
import BasePage from "./BasePage";
import LoginPage from "./LoginPage";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import ProtectedRoute from "./ProtectedRoute";
import ZillowUrlStateExample from "./ZillowUrlStateExample";
import { useZillowUrlState } from "./hooks/useZillowUrlState";

function App() {
  const zillowUrlState = useZillowUrlState();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <ZillowUrlStateExample zillowUrlState={zillowUrlState} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/comments"
              element={
                <ProtectedRoute>
                  <CommentPage zillowUrlState={zillowUrlState} />
                </ProtectedRoute>
              }
            />
            <Route path="/homedetails/*" element={<Navigate to="/comments" replace />} />
            <Route path="/b/*" element={<Navigate to="/comments" replace />} />
            <Route path="/*" element={<Navigate to="/comments" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
