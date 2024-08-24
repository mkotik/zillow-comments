import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.scss";
import CommentPage from "./CommentPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/homedetails/*" element={<CommentPage />} />
          {/* Add other routes here if needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
