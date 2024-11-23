const Comment = require("../models/Comment");
const ReplyComment = require("../models/ReplyComment");
const { v4: uuidv4 } = require("uuid");

exports.getCommentsByAddressFromDB = async (address) => {
  const comments = await Comment.find({ address });
  const commentIds = comments.map((comment) => comment.id);

  const replyComments = await ReplyComment.find({
    parentCommentId: { $in: commentIds },
  }).sort({ date: -1 }); // Changed from 1 to -1 for descending order

  const commentMap = comments.reduce((acc, comment) => {
    acc[comment.id] = { ...comment.toObject(), replies: [] };
    return acc;
  }, {});

  replyComments.forEach((reply) => {
    if (commentMap[reply.parentCommentId]) {
      commentMap[reply.parentCommentId].replies.push(reply);
    }
  });

  const sortedComments = Object.values(commentMap).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return sortedComments;
};

exports.createComment = async (req, res) => {
  const newComment = new Comment({
    id: uuidv4(),
    address: req.body.address,
    name: req.body.name,
    content: req.body.content,
    date: req.body.date || Date.now(),
  });
  console.log("newComment", newComment);
  try {
    await newComment.save();
    const comments = await this.getCommentsByAddressFromDB(req.body.address);
    res.status(201).send(comments);
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

    const comments = await this.getCommentsByAddressFromDB(address);

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err });
  }
};
