const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { requireAuth } = require("../middleware/requireAuth");

router.post("/", requireAuth, commentController.createComment);
router.get("/", commentController.getCommentsByAddress);

module.exports = router;
