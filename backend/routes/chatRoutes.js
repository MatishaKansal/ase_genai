const express = require("express");
const upload = require("../middleware/upload");
const { postChat, getChat, getAllNotebooks } = require("../controllers/chatController.js");

const router = express.Router();

router.post("/chat/:userId", upload.array("files", 5), postChat);

router.get("/chat/:userId/:notebookId", getChat);

router.get("/chat/:userId", getAllNotebooks);

module.exports = router;
