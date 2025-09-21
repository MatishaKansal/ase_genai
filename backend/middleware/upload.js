const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("./cloudinary"); // cloudinary.v2 instance

// Store files in memory
const storage = multer.memoryStorage();
const multerUpload = multer({ storage });

/**
 * Middleware: handle multipart upload and push files to Cloudinary
 */
const uploadAndToCloudinary = (req, res, next) => {
  multerUpload.array("files")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      console.log("No files uploaded");
      return next();
    }
    console.log(`Uploading ${req.files.length} files to Cloudinary...`);

    try {
      await Promise.all(
        req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                  if (error) return reject(error);
                  file.path = result.secure_url;
                  file.public_id = result.public_id;
                  file.mimetype = result.format || file.mimetype;
                  resolve();
                }
              );
              streamifier.createReadStream(file.buffer).pipe(uploadStream);
            })
        )
      );
      return next();
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return next(uploadErr);
    }
  });
};

module.exports = uploadAndToCloudinary;
