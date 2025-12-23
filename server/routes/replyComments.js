const express = require("express");
const router = express.Router();
const replyCommentController = require("../controllers/replyCommentController");
const { requireAuth } = require("../middleware/requireAuth");

router.post("/", requireAuth, replyCommentController.createReplyComment);

module.exports = router;
