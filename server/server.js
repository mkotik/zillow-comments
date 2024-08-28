require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const commentRoutes = require("./routes/comments");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/comments", commentRoutes);

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
