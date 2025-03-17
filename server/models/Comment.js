const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  address: String,
  name: String,
  content: String,
  attachments: [
    {
      url: String,
      filename: String,
      contentType: String,
      size: Number,
      isImage: Boolean,
    },
  ],
  date: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
