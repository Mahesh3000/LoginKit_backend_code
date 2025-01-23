const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const uploadImage = async (req, res) => {
  const file = req.body; // The uploaded image buffer (directly from the raw body)

  if (!file || !file.image) {
    return res.status(400).send("No file uploaded.");
  }

  const buffer = Buffer.from(file.image, "base64"); // Convert base64 to buffer

  const bucketParams = {
    Bucket: "loginkit", // Your S3 bucket name
    Key: `images/${Date.now()}_${file.filename}`, // File path in the bucket (with timestamp)
    Body: buffer,
    ContentType: "image/png", // MIME type (adjust if needed)
    ACL: "public-read", // Permissions
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    res.status(200).send({ message: "Image uploaded successfully", data });
  } catch (err) {
    console.log("Error uploading image:", err);
    res.status(500).send("Error uploading image");
  }
};

module.exports = { uploadImage };
