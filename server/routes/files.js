const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const { requireAuth } = require("../middleware/requireAuth");

router.post("/upload", requireAuth, fileController.uploadFiles);
router.post("/delete", requireAuth, fileController.deleteFile);

module.exports = router;
