// cloudinary.js
const cloudinary = require("cloudinary").v2;
const path = require("path");
const dotenv = require("dotenv");

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Destructure environment variables
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Check if any required env variable is missing
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error(
    "❌ Cloudinary environment variables missing. Please check your .env file."
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary configured with cloud name:", CLOUDINARY_CLOUD_NAME);

module.exports = cloudinary;
