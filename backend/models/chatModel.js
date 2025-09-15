const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  notebookId: { type: String, required: true },

  messages: [
    {
      sender: { type: String, enum: ["user", "bot"], required: true },
      message: { type: String, default: "" },
      language: { type: String, default: "en" },
      file: {
        fileName: String,
        fileType: String,
        fileUrl: String,
      },
    },
  ],
}, { timestamps: true });

// optional: enforce unique notebook per user
// chatSchema.index({ userId: 1, notebookId: 1 }, { unique: true });

module.exports = mongoose.model("Chat", chatSchema);
