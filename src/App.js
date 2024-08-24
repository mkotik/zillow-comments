import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.scss";
import CommentPage from "./CommentPage";
import BasePage from "./BasePage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/homedetails/*" element={<CommentPage />} />
          <Route path="/*" element={<BasePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
