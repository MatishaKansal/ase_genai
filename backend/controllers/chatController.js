const Chat = require("../models/chatModel");
const { v4: uuidv4 } = require("uuid");
const { callAiChat } = require("./aiController");

const postChat = async (req, res) => {
  try {
    console.log("📩 POST /api/chat incoming");
    const { userId } = req.params;
    let { notebookId, messages, language } = req.body;

    if (typeof messages === "string") {
      try {
        messages = JSON.parse(messages);
      } catch {
        return res.status(400).json({ error: "Invalid messages JSON" });
      }
    }

    if (!Array.isArray(messages)) messages = [];
    if (!notebookId) notebookId = uuidv4();

    // attach uploaded file (single)
    if (req.file) {
      const fileObj = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl: req.file.path, // Cloudinary URL
        publicId: req.file.public_id,
      };

      if (messages.length > 0) {
        messages[messages.length - 1].files = [fileObj];
      } else {
        messages.push({
          sender: "user",
          message: "",
          language: language || "en",
          files: [fileObj],
        });
      }
    }

    // AI response
    const aiResponse = await callAiChat(messages, language || "en");

    if (aiResponse) {
      messages.push({
        sender: "bot",
        message: aiResponse.text || "",
        audioUrl: aiResponse.audioUrl || null,
      });
    }

    // save chat
    const saved = await Chat.findOneAndUpdate(
      { userId, notebookId },
      {
        $setOnInsert: { userId, notebookId, createdAt: new Date() },
        $set: { updatedAt: new Date() },
        $push: { messages: { $each: messages } },
      },
      { upsert: true, new: true }
    );

    return res.json({
      notebookId,
      messages: saved.messages,
    });
  } catch (err) {
    console.error("❌ postChat error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// GET chat for a notebook
const getChat = async (req, resp) => {
  try {
    const { userId, notebookId } = req.params;
    const chat = await Chat.findOne({ userId, notebookId });

    if (!chat) return resp.status(404).json({ message: "No chat found" });

    resp.status(200).json({
      notebookId: chat.notebookId,
      messages: Array.isArray(chat.messages) ? chat.messages : [],
    });
  } catch (error) {
    resp.status(500).json({ error: error.message });
  }
};

// GET all notebooks for a user
const getAllNotebooks = async (req, resp) => {
  try {
    const { userId } = req.params;
    const notebooks = await Chat.find({ userId }).sort({ updatedAt: -1 });

    const formatted = notebooks.map((chat) => ({
      notebookId: chat.notebookId,
      title:
        chat.messages[0]?.message?.slice(0, 30).trim() || "Untitled Notebook",
      preview:
        chat.messages[chat.messages.length - 1]?.message?.slice(0, 40).trim() ||
        "",
      messageCount: chat.messages.length,
    }));

    resp.status(200).json(formatted);
  } catch (error) {
    resp.status(500).json({ error: error.message });
  }
};

module.exports = { postChat, getChat, getAllNotebooks };