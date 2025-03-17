const ReplyComment = require("../models/ReplyComment");
const { getCommentsByAddressFromDB } = require("./commentController");
const { v4: uuidv4 } = require("uuid");

exports.createReplyComment = async (req, res) => {
  console.log("Creating reply comment with data:", req.body);

  // Ensure attachments is always an array, even if not provided
  const attachments = req.body.attachments || [];
  console.log("Reply attachments:", attachments);

  const newComment = new ReplyComment({
    id: uuidv4(),
    address: req.body.address,
    name: req.body.name,
    content: req.body.content,
    attachments: attachments, // Explicitly set attachments
    parentCommentId: req.body.parentCommentId,
    date: req.body.date || Date.now(),
  });

  console.log("New reply comment object:", newComment);

  try {
    const savedComment = await newComment.save();
    console.log("Saved reply comment:", savedComment);

    const comments = await getCommentsByAddressFromDB(req.body.address);
    console.log("Number of comments retrieved:", comments.length);

    res.status(201).send(comments);
  } catch (err) {
    console.error("Error saving reply comment:", err);
    res.status(400).send(err);
  }
};
