const mongoose = require("mongoose");
const userModel = require("./userModel");

const chatSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    notebookId: { type: String, required: true },
    messages: [
        {
            sender: { type: String, enum: ["user", "bot"], required: true },
            message: { type: String },
            file: {
                fileName: String,
                fileType: String,
                fileUrl: String  
            }
        }
    ]
});

module.exports = mongoose.model("Chat", chatSchema);