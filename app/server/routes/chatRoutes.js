import express from 'express';
import * as chatController from "../controllers/chatController.js";
import Chat from "../models/chat.js";
import ChatMessage from "../models/chatMessage.js";

const router = express.Router();

// Create a new chat session
router.post("/chats", chatController.createChat);

// Fetch all chats for a session
router.get("/chats", chatController.getChats);

// Get a specific chat by ID
router.get("/chats/:chatId", chatController.getChatById);

// Add a new message to an existing chat
router.post("/chats/:chatId/messages", chatController.addMessage);

// Update chat title
router.put("/chats/:chatId/title", chatController.updateChatTitle);

// Delete a chat session
router.delete("/chats/:chatId", chatController.deleteChat);

// Fetch chat history (latest 100 messages)
router.get("/history", async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Session ID is required" 
      });
    }

    const messages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Get chat history error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch chat history" 
    });
  }
});

// Send a message and receive an AI-generated response
router.post("/message", async (req, res) => {
  try {
    const { content, sessionId } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Message content cannot be empty" 
      });
    }

    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Session ID is required" 
      });
    }

    // Save user message to database
    const userMessage = await ChatMessage.create({
      sessionId,
      content,
      isUserMessage: true,
    });

    // TODO: Replace with actual AI response logic
    const aiResponse = "This is a placeholder AI response. AI-generated response goes here.";

    // Save AI response
    const aiMessage = await ChatMessage.create({
      sessionId,
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
    return res.status(500).json({ 
      success: false, 
      message: "Failed to process message" 
    });
  }
});

export default router;