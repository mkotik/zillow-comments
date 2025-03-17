const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Configure Backblaze B2 integration
const s3 = new aws.S3({
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
  region: process.env.B2_REGION,
});

// Configure upload middleware
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.B2_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and common document formats
    const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file format. Allowed formats: images, PDF, DOC, DOCX, XLS, XLSX, TXT"
        )
      );
    }
  },
}).array("attachments", 5); // Allow up to 5 attachments per comment

// Handle file uploads
exports.uploadFiles = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Format attachment data for storage in MongoDB
    const attachments = req.files.map((file) => ({
      url: file.location,
      filename: file.originalname,
      contentType: file.contentType || file.mimetype,
      size: file.size,
      isImage: file.contentType
        ? file.contentType.startsWith("image")
        : file.mimetype.startsWith("image"),
    }));

    return res.status(200).json({
      message: "Files uploaded successfully",
      attachments: attachments,
    });
  });
};

// Delete file from B2
exports.deleteFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Extract key from the file URL
    const urlParts = fileUrl.split("/");
    const key = urlParts[urlParts.length - 1];

    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};
