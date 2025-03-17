const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Configure Backblaze B2 integration
// Using proper AWS SDK configuration for Backblaze
const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APP_KEY,
  region: process.env.B2_REGION,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

// Test connection to Backblaze
s3.listBuckets((err, data) => {
  if (err) {
    console.error("Error connecting to Backblaze B2:", err);
  } else {
    console.log(
      "Successfully connected to Backblaze B2, available buckets:",
      data.Buckets.map((b) => b.Name)
    );
  }
});

// Configure upload middleware with Backblaze B2
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.B2_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // Generate a unique filename with original extension
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
    metadata: (req, file, cb) => {
      cb(null, { originalName: file.originalname });
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
  console.log("Upload to Backblaze request received");

  upload(req, res, function (err) {
    if (err) {
      console.error("Backblaze upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    console.log("Files uploaded to Backblaze:", req.files);

    if (!req.files || req.files.length === 0) {
      console.error("No files in the request");
      return res.status(400).json({ error: "No files were uploaded" });
    }

    try {
      // Format attachment data for storage in MongoDB
      const attachments = req.files.map((file) => {
        console.log("Processing uploaded file:", file);

        return {
          url: file.location, // S3/Backblaze URL
          filename: file.originalname,
          contentType: file.contentType || file.mimetype,
          size: file.size,
          isImage: (file.contentType || file.mimetype).startsWith("image"),
        };
      });

      console.log("Processed Backblaze attachments:", attachments);

      return res.status(200).json({
        message: "Files uploaded successfully to Backblaze",
        attachments: attachments,
      });
    } catch (error) {
      console.error("Error processing Backblaze uploaded files:", error);
      return res
        .status(500)
        .json({
          error: "Error processing uploaded files",
          details: error.message,
        });
    }
  });
};

// Delete file from Backblaze B2
exports.deleteFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Extract key from the file URL
    const urlParts = fileUrl.split("/");
    const key = urlParts[urlParts.length - 1];

    console.log(`Attempting to delete file from Backblaze B2: ${key}`);

    const params = {
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    console.log(`File deleted from Backblaze B2: ${key}`);

    res
      .status(200)
      .json({ message: "File deleted successfully from Backblaze B2" });
  } catch (error) {
    console.error("Error deleting file from Backblaze B2:", error);
    res
      .status(500)
      .json({
        error: "Failed to delete file from Backblaze B2",
        details: error.message,
      });
  }
};
