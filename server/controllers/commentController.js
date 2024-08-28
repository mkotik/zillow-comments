const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
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
};
