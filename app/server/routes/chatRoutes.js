import express from 'express';
import * as chatController from "../controllers/chatController.js";
import Chat from "../models/chat.js";
import ChatMessage from "../models/chatMessage.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// Create a new chat session
router.post("/chats", verifyToken, chatController.createChat);

// Fetch all chats for a user
router.get("/chats", verifyToken, chatController.getChats);

// Get a specific chat by ID
router.get("/chats/:chatId", verifyToken, chatController.getChatById);

// Add a new message to an existing chat
router.post("/chats/:chatId/messages", verifyToken, chatController.addMessage);

// Update chat title
router.put("/chats/:chatId/title", verifyToken, chatController.updateChatTitle);

// Delete a chat session
router.delete("/chats/:chatId", verifyToken, chatController.deleteChat);

// Fetch chat history (latest 100 messages)
router.get("/history", verifyToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Sort by latest messages first
      .limit(100);

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Get chat history error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch chat history" });
  }
});

// Send a message and receive an AI-generated response
router.post("/message", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" });
    }

    // Check if user ID exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User authentication failed" });
    }

    // Save user message to database
    const userMessage = await ChatMessage.create({
      userId: req.user._id,
      content,
      isUserMessage: true,
    });

    // TODO: Replace with actual AI response logic
    const aiResponse = "This is a placeholder AI response. AI-generated response goes here.";

    // Save AI response
    const aiMessage = await ChatMessage.create({
      userId: req.user._id,
      content: aiResponse,
      isUserMessage: false,
    });

    return res.status(200).json({
      success: true,
      messages: [
        {
          id: userMessage._id,
          content: userMessage.content,
          isUserMessage: true,
          createdAt: userMessage.createdAt,
        },
        {
          id: aiMessage._id,
          content: aiMessage.content,
          isUserMessage: false,
          createdAt: aiMessage.createdAt,
        },
      ],
    });
  } catch (error) {
    console.error("❌ Send message error:", error);
    return res.status(500).json({ success: false, message: "Failed to process message" });
  }
});

export default router;