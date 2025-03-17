const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const fs = require("fs");
const os = require("os");

// Configure Backblaze B2 integration
const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APP_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

// Configure upload middleware for initial file processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit initially to allow for compression
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
}).array("attachments", 6); // Allow up to 6 attachments per comment

// Handle file uploads with image compression
exports.uploadFiles = (req, res) => {
  console.log("Upload to Backblaze request received");

  upload(req, res, async function (err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      console.error("No files in the request");
      return res.status(400).json({ error: "No files were uploaded" });
    }

    try {
      // Process each file (compress images, leave other files as they are)
      const processedFiles = [];

      for (const file of req.files) {
        console.log(
          `Processing file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`
        );

        // Check if it's an image
        const isImage = file.mimetype.startsWith("image/");
        let processedBuffer = file.buffer;
        let contentType = file.mimetype;

        // Compress images that are over 1MB
        if (isImage && file.size > 1 * 1024 * 1024) {
          try {
            console.log(`Compressing image: ${file.originalname}`);

            // Determine format from mimetype
            const format =
              file.mimetype.split("/")[1] === "png" ? "png" : "jpeg";

            // Process with sharp
            processedBuffer = await sharp(file.buffer)
              .resize({
                width: 1600,
                height: 1200,
                fit: "inside",
                withoutEnlargement: true,
              })
              .toFormat(format, { quality: 80 }) // 80% quality for JPEG
              .toBuffer();

            console.log(
              `Image compressed from ${file.size} to ${processedBuffer.length} bytes`
            );
          } catch (compressionError) {
            console.error(
              `Error compressing image: ${compressionError.message}`
            );
            // Fall back to original buffer if compression fails
            processedBuffer = file.buffer;
          }
        }

        // Generate a unique filename
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;

        // Upload to Backblaze B2
        const uploadParams = {
          Bucket: process.env.B2_BUCKET_NAME,
          Key: fileName,
          Body: processedBuffer,
          ContentType: contentType,
          ACL: "public-read",
        };

        console.log(`Uploading to Backblaze: ${fileName}`);
        const uploadResult = await s3.upload(uploadParams).promise();
        console.log(`Successfully uploaded to: ${uploadResult.Location}`);

        processedFiles.push({
          url: uploadResult.Location,
          filename: file.originalname,
          contentType: contentType,
          size: processedBuffer.length,
          isImage: isImage,
        });
      }

      console.log(`Successfully processed ${processedFiles.length} files`);
      return res.status(200).json({
        message: "Files uploaded successfully to Backblaze",
        attachments: processedFiles,
      });
    } catch (error) {
      console.error("Error processing or uploading files:", error);
      return res.status(500).json({
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
