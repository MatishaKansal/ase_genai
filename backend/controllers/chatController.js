const Chat = require("../models/chatModel.js");
const { v4: uuidv4 } = require("uuid");
const { callAiChat } = require("./aiController.js");

// POST Chat
const postChat = async (req, resp) => {
  try {
    const { userId } = req.params;
    let { notebookId, messages, language } = req.body;
    console.log("notebookId", notebookId);
    console.log("messages", messages);
    console.log("language", language);
    console.log("req.files", req.files);
    if (!language) {
      language = "en";
    }

    if (messages && typeof messages === "string") {
      messages = JSON.parse(messages);
    }

    if (!notebookId) {
      notebookId = uuidv4();
    }
    let chat = await Chat.findOne({ userId, notebookId });

    if (!chat) {
      chat = new Chat({
        userId,
        notebookId,
        messages: [],
      });
    }

    if (req.files && req.files.length > 0) {
      console.log("req.files", req.files);
      const fileObjects = req.files.map((file) => ({
        fileName: file.originalname,
        fileType: file.mimetype,
        fileUrl: file.path,
        publicId: file.public_id,
      }));

      const userMessageWithFiles = {
        sender: "user",
        message: messages[0]?.message || "",
        language: language,
        files: fileObjects,
      };
      chat.messages.push(userMessageWithFiles);
    } else if (messages && messages.length > 0) {
      chat.messages.push(...messages);
    }
    const aiReply = await callAiChat(
      messages[0].message,
      language,
      req.files
    );
    chat.messages.push({
      sender: "ai",
      message: aiReply,
      language: language,
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