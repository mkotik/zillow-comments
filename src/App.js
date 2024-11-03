import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.scss";
import CommentPage from "./CommentPage";
import BasePage from "./BasePage";
import LoginPage from "./LoginPage";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/homedetails/*"
            element={
              // <ProtectedRoute>
              <CommentPage />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/b/*"
            element={
              // <ProtectedRoute>
              <CommentPage />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              // <ProtectedRoute>
              <BasePage />
              // </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
