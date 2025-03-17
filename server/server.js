require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const commentRoutes = require("./routes/comments");
const replyCommentRoutes = require("./routes/replyComments");
const fileRoutes = require("./routes/files");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Zillow Comments API" });
});

// Routes
app.use("/comments", commentRoutes);
app.use("/replycomments", replyCommentRoutes);
app.use("/files", fileRoutes);

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
