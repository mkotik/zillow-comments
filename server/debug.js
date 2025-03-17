// Add this code to a temporary file to test your Backblaze connection
// Run it with Node.js to verify your credentials and settings

require("dotenv").config();
const AWS = require("aws-sdk");

console.log("Attempting to connect to Backblaze B2...");
console.log("Using endpoint:", process.env.B2_ENDPOINT);
console.log("Using bucket:", process.env.B2_BUCKET_NAME);
console.log("Using keyID:", process.env.B2_KEY_ID ? "[SET]" : "[NOT SET]");
console.log("Using appKey:", process.env.B2_APP_KEY ? "[SET]" : "[NOT SET]");

const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APP_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

// Test listing buckets
s3.listBuckets((err, data) => {
  if (err) {
    console.error("Error connecting to Backblaze B2:");
    console.error(err);
    return;
  }

  console.log("Successfully connected to Backblaze B2!");
  console.log(
    "Available buckets:",
    data.Buckets.map((b) => b.Name)
  );

  // Now try to list objects in the specific bucket
  s3.listObjectsV2({ Bucket: process.env.B2_BUCKET_NAME }, (err, data) => {
    if (err) {
      console.error("Error listing objects in bucket:");
      console.error(err);
      return;
    }

    console.log(
      `Successfully listed objects in bucket: ${process.env.B2_BUCKET_NAME}`
    );
    console.log(`Found ${data.Contents ? data.Contents.length : 0} objects`);

    if (data.Contents && data.Contents.length > 0) {
      console.log("First few objects:");
      data.Contents.slice(0, 5).forEach((obj) => {
        console.log(` - ${obj.Key} (${obj.Size} bytes)`);
      });
    }
  });
});
