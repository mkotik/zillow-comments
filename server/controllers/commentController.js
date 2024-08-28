const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  const newComment = new Comment({
    address: req.body.address,
    name: req.body.name,
    content: req.body.content,
    date: req.body.date || Date.now(),
  });
  try {
    await newComment.save();
    res.status(201).send(newComment);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.getCommentsByAddress = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }
    const comments = await Comment.find({ address });
    console.log("comments", comments);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err });
  }
};
