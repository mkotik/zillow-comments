const Comment = require("../models/Comment");
const ReplyComment = require("../models/ReplyComment");
const { v4: uuidv4 } = require("uuid");

exports.getCommentsByAddressFromDB = async (address) => {
  console.log(`Retrieving comments for address: ${address}`);

  // Get all main comments for this address
  const comments = await Comment.find({ address });
  console.log(`Found ${comments.length} main comments`);

  // Extract comment IDs to find replies
  const commentIds = comments.map((comment) => comment.id);
  console.log(`Comment IDs to find replies for: ${commentIds}`);

  // Get all reply comments for these parent comments
  const replyComments = await ReplyComment.find({
    parentCommentId: { $in: commentIds },
  }).sort({ date: -1 }); // Changed from 1 to -1 for descending order

  console.log(`Found ${replyComments.length} reply comments`);

  // Log sample of the first reply comment
  if (replyComments.length > 0) {
    console.log(
      "Sample reply comment fields:",
      Object.keys(replyComments[0].toObject())
    );
    console.log("Sample reply attachments:", replyComments[0].attachments);
  }

  // Create a map of comments with their replies
  const commentMap = comments.reduce((acc, comment) => {
    acc[comment.id] = { ...comment.toObject(), replies: [] };
    return acc;
  }, {});

  // Add replies to their parent comments
  replyComments.forEach((reply) => {
    if (commentMap[reply.parentCommentId]) {
      // Convert to object to ensure all fields are included
      const replyObject = reply.toObject();
      console.log(
        `Adding reply to comment ${reply.parentCommentId}, has attachments: ${
          replyObject.attachments?.length || 0
        }`
      );
      commentMap[reply.parentCommentId].replies.push(replyObject);
    }
  });

  // Sort comments by date (newest first)
  const sortedComments = Object.values(commentMap).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return sortedComments;
};

exports.createComment = async (req, res) => {
  console.log("Creating comment with data:", req.body);

  // Ensure attachments is always an array, even if not provided
  const attachments = req.body.attachments || [];
  console.log("Comment attachments:", attachments);

  const newComment = new Comment({
    id: uuidv4(),
    address: req.body.address,
    name: req.body.name,
    content: req.body.content,
    attachments: attachments,
    date: req.body.date || Date.now(),
  });

  console.log("New comment object:", newComment);

  try {
    await newComment.save();
    const comments = await this.getCommentsByAddressFromDB(req.body.address);
    res.status(201).send(comments);
  } catch (err) {
    console.error("Error saving comment:", err);
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
