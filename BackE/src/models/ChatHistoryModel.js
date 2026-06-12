const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        sessionId: { type: String, required: true },
        messages: [
            {
                role: { type: String, enum: ["user", "model"], required: true },
                content: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

module.exports = ChatHistory;
