const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("./cloudinary"); // ensure this exports cloudinary.v2

const storage = multer.memoryStorage();
const multerUpload = multer({ storage });

const uploadAndToCloudinary = (req, res, next) => {
  multerUpload.array("files")(req, res, async (err) => {
    if (err) {
      console.error("multer error:", err);
      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      await Promise.all(
        req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                  if (error) return reject(error);
                  file.path = result.secure_url || result.url;
                  file.public_id = result.public_id;
                  resolve();
                }
              );
              streamifier.createReadStream(file.buffer).pipe(uploadStream);
            })
        )
      );
      next();
    } catch (uploadErr) {
      console.error("cloudinary upload error:", uploadErr);
      next(uploadErr);
    }
  });
};

module.exports = uploadAndToCloudinary;