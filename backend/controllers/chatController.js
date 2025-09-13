const Chat = require("../models/chatModel.js");
const { v4: uuidv4 } = require("uuid");

const postChat = async (req, resp) => {
    try {
        const { userId } = req.params;
        let { notebookId, messages } = req.body;

        // Generate notebookId if it's a new chat
        if (!notebookId) {
            notebookId = uuidv4();
        }

        // Parse messages if sent as string
        if (typeof messages === "string") {
            try {
                messages = JSON.parse(messages);
            } catch (e) {
                return resp.status(400).json({ error: "Invalid messages format" });
            }
        }

        // If files exist, convert them into message objects
        if (req.files && req.files.length > 0) {
            const fileMessages = req.files.map(file => ({
                sender: "user",
                message: "",
                file: {
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileUrl: `/uploads/${file.filename}`
                }
            }));

            messages = messages ? [...messages, ...fileMessages] : fileMessages;
        }

        // Validate messages array
        if (!messages || !Array.isArray(messages)) {
            return resp.status(400).json({ error: "Messages should be an array" });
        }

        // Save or update chat
        let chat = await Chat.findOne({ userId, notebookId });

        if (!chat) {
            chat = new Chat({ userId, notebookId, messages });
        } else {
            chat.messages.push(...messages);
        }

        await chat.save();
        resp.status(200).json(chat);
    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
};


const getChat = async (req, resp) => {
    try {
        const { userId, notebookId } = req.params;
        const chat = await Chat.findOne({ userId, notebookId });

        if (!chat) return resp.status(404).json({ message: "No chat found" });

        resp.status(200).json(chat.messages);
    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
};

const getAllNotebooks = async (req, resp) => {
    try {
        const { userId } = req.params;
        const notebooks = await Chat.find({ userId })

        const formatted = notebooks.map(chat => ({
            notebookId: chat.notebookId,
            title: chat.messages.length > 0
                ? chat.messages[0].message.slice(0, 30) // first message as title
                : "Untitled Notebook",
            preview: chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1].message.slice(0, 40) // last message as preview
                : "",
            messageCount: chat.messages.length
        }));

        resp.status(200).json(formatted);
    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
};

module.exports = { postChat, getChat, getAllNotebooks };
