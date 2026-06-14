const express = require("express");
const router = express.Router();
const ChatbotController = require("../controllers/ChatbotController");
const { authUserMiddleWare } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

router.post("/chat", ChatbotController.chat);

router.get("/history/:id", (req, res, next) => {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
        return authUserMiddleWare(req, res, next);
    }
    next();
}, ChatbotController.getHistory);

router.delete("/clear/:id", (req, res, next) => {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
        return authUserMiddleWare(req, res, next);
    }
    next();
}, ChatbotController.clearHistory);

module.exports = router;
