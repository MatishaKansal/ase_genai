const Chat = require("../models/chatModel.js");
const { v4: uuidv4 } = require("uuid");

// POST Chat
const postChat = async (req, resp) => {
  try {
    const { userId } = req.params;
    let { notebookId, messages, language } = req.body;

    const allowedLangs = ["en", "hi", "pu", "ta"];

    // Validate request-level language
    if (language && !allowedLangs.includes(language)) {
      return resp.status(400).json({ error: "Invalid language" });
    }

    // Parse messages if sent as string
    if (typeof messages === "string") {
      try {
        messages = JSON.parse(messages);
      } catch (e) {
        return resp.status(400).json({ error: "Invalid messages format" });
      }
    }

    // Ensure messages is an array
    if (!Array.isArray(messages)) messages = [];

    // Generate notebookId if new chat
    if (!notebookId) notebookId = uuidv4();

    // Attach uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        if (messages[index]) {
          messages[index].file = {
            fileName: file.originalname,
            fileType: file.mimetype,
            fileUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
          };
          if (!messages[index].message) messages[index].message = "";
        }
      });
    } else {
      messages.forEach((msg) => {
        if (!msg.file) msg.file = null;
      });
    }

    // Ensure each message has sender and language
    messages = messages.map((msg) => ({
      sender: msg.sender || "user",
      message: msg.message || "",
      language: msg.language && allowedLangs.includes(msg.language)
        ? msg.language
        : (language || "en"),
      file: msg.file || null,
    }));

    // Find or create chat
    let chat = await Chat.findOne({ userId, notebookId });
    if (!chat) {
      chat = new Chat({ userId, notebookId, messages: [] });
    }

    // Push user messages
    chat.messages.push(...messages);

    // Bot auto-reply in last message language
    const lastUserLang = messages.length > 0
      ? messages[messages.length - 1].language
      : (language || "en");

    chat.messages.push({
      sender: "bot",
      message: `Got your message 👍. LegalMitra is here to help! (Language: ${lastUserLang})`,
      language: lastUserLang,
      file: null,
    });

    await chat.save();

    resp.status(200).json({
      notebookId: chat.notebookId,
      messages: chat.messages,
    });
  } catch (error) {
    resp.status(500).json({ error: error.message });
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