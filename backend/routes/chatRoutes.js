const express = require("express");
const { upload } = require("../middleware/cloudinary"); // <-- updated
const { postChat, getChat, getAllNotebooks } = require("../controllers/chatController.js");
const { processDocument } = require("../controllers/aiController.js");

const router = express.Router();

router.post("/chat/:userId", upload.array("files", 5), postChat);

router.get("/chat/:userId/:notebookId", getChat);

router.get("/chat/:userId", getAllNotebooks);

// Proxy route for AI document processing
const multer = require("multer");
const memoryUpload = multer({ storage: multer.memoryStorage() });
router.post("/process-document", memoryUpload.single("file"), processDocument);

module.exports = router;
