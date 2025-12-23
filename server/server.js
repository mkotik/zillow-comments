require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const connectDB = require("./config/database");
const commentRoutes = require("./routes/comments");
const replyCommentRoutes = require("./routes/replyComments");
const fileRoutes = require("./routes/files");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
if (process.env.NODE_ENV === "production") {
  // Needed for secure cookies behind proxies (Railway/Render/etc.)
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

const rawOrigins =
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser clients (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Zillow Comments API" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/comments", commentRoutes);
app.use("/replycomments", replyCommentRoutes);
app.use("/files", fileRoutes);

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
