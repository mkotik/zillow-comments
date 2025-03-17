const ReplyComment = require("../models/ReplyComment");
const { getCommentsByAddressFromDB } = require("./commentController");
const { v4: uuidv4 } = require("uuid");

exports.createReplyComment = async (req, res) => {
  const newComment = new ReplyComment({
    id: uuidv4(),
    address: req.body.address,
    name: req.body.name,
    content: req.body.content,
    attachments: req.body.attachments || [],
    parentCommentId: req.body.parentCommentId,
    date: req.body.date || Date.now(),
  });

  try {
    await newComment.save();
    const comments = await getCommentsByAddressFromDB(req.body.address);

    res.status(201).send(comments);
  } catch (err) {
    res.status(400).send(err);
  }
};
