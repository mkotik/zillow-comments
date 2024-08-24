const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a schema
const commentSchema = new mongoose.Schema({
  address: String,
  content: String,
  date: { type: Date, default: Date.now },
});

// Create a model
const Comment = mongoose.model("Comment", commentSchema);

// API endpoint to create a comment
app.post("/comments", async (req, res) => {
  const newComment = new Comment({
    address: req.body.address,
    content: req.body.content,
    date: req.body.date || Date.now(),
  });
  try {
    await newComment.save();
    res.status(201).send(newComment);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Start the server
app.listen(6000, () => {
  console.log("Server is running on port 6000");
});
