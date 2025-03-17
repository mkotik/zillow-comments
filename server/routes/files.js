const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

router.post("/upload", fileController.uploadFiles);
router.post("/delete", fileController.deleteFile);

module.exports = router;
