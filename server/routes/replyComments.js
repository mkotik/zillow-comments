const express = require("express");
const router = express.Router();
const replyCommentController = require("../controllers/replyCommentController");

router.post("/", replyCommentController.createReplyComment);

module.exports = router;
