const mongoose = require("mongoose");

const replyCommentSchema = new mongoose.Schema({
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
  parentCommentId: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const ReplyComment = mongoose.model("ReplyComment", replyCommentSchema);

module.exports = ReplyComment;
