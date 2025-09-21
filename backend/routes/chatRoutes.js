const express = require("express");
const uploadAndToCloudinary = require("../middleware/upload");  // ✅ default import
const { postChat, getChat, getAllNotebooks } = require("../controllers/chatController.js");
const { processDocument } = require("../controllers/aiController.js");

const router = express.Router();

router.post("/chat/:userId",(req, res, next) => {
  console.log("Headers received:", req.headers);
  next();
}, uploadAndToCloudinary, postChat);
console.log("Router setup: POST /chat/:userId with file upload middleware");

router.get("/chat/:userId/:notebookId", getChat);
router.get("/chat/:userId", getAllNotebooks);

// Proxy route for AI document processing
const multer = require("multer");
const memoryUpload = multer({ storage: multer.memoryStorage() });
console.log("Router setup: POST /process-document with memory upload middleware");

router.post("/process-document", memoryUpload.single("file"), processDocument);

module.exports = router;
