const chatbotService = require("../services/ChatbotService");
const ChatHistory = require("../models/ChatHistoryModel");
const mongoose = require("mongoose");

class ChatbotController {
    async chat(req, res) {
        try {
            const { message, userId, sessionId } = req.body;
            if (!message) {
                return res.status(400).json({ error: "Message is required" });
            }

            const response = await chatbotService.generateResponse(message, userId, sessionId);
            res.json({ response });
        } catch (error) {
            console.error("Error in chatbot controller chat:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getHistory(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "ID is required" });
            }

            let history = null;
            if (mongoose.Types.ObjectId.isValid(id)) {
                history = await ChatHistory.findOne({ userId: id });
            } else {
                history = await ChatHistory.findOne({ sessionId: id, userId: null });
            }

            res.json({
                status: "OK",
                messages: history ? history.messages : []
            });
        } catch (error) {
            console.error("Error in getHistory:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async clearHistory(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "ID is required" });
            }

            if (mongoose.Types.ObjectId.isValid(id)) {
                await ChatHistory.deleteOne({ userId: id });
            } else {
                await ChatHistory.deleteOne({ sessionId: id, userId: null });
            }

            res.json({
                status: "OK",
                message: "Chat history cleared successfully"
            });
        } catch (error) {
            console.error("Error in clearHistory:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

module.exports = new ChatbotController();
