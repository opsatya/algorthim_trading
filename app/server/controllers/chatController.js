import Chat from '../models/chat.js';
import { handleAsyncErrors } from '../middlewares/error.js';
import { success, error } from '../utils/responseHandler.js';

export const createChat = handleAsyncErrors(async (req, res) => {
  const { sessionId, initialMessage } = req.body;
  
  if (!sessionId) {
    return error(res, 'Session ID is required', 400);
  }

  const newChat = await Chat.create({
    sessionId,
    messages: initialMessage ? [
      { content: initialMessage, sender: 'user' }
    ] : []
  });
  
  return success(res, { chat: newChat }, 201);
});

export const getChats = handleAsyncErrors(async (req, res) => {
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return error(res, 'Session ID is required', 400);
  }

  const chats = await Chat.find({ sessionId })
    .select('_id title lastUpdated')
    .sort({ lastUpdated: -1 });
  
  return success(res, { chats });
});

export const getChatById = handleAsyncErrors(async (req, res) => {
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return error(res, 'Session ID is required', 400);
  }

  const chat = await Chat.findOne({
    _id: req.params.chatId,
    sessionId
  });
  
  if (!chat) {
    return error(res, 'Chat not found', 404);
  }
  
  return success(res, { chat });
});

export const addMessage = handleAsyncErrors(async (req, res) => {
  const { chatId } = req.params;
  const { content, sender, sessionId } = req.body;
  
  if (!content || !sender || !sessionId) {
    return error(res, 'Content, sender, and sessionId are required', 400);
  }
  
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, sessionId },
    {
      $push: { messages: { content, sender } },
      $set: { lastUpdated: Date.now() }
    },
    { new: true }
  );
  
  if (!chat) {
    return error(res, 'Chat not found', 404);
  }
  
  return success(res, { chat });
});

export const updateChatTitle = handleAsyncErrors(async (req, res) => {
  const { chatId } = req.params;
  const { title, sessionId } = req.body;
  
  if (!title || !sessionId) {
    return error(res, 'Title and sessionId are required', 400);
  }
  
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, sessionId },
    { $set: { title } },
    { new: true }
  );
  
  if (!chat) {
    return error(res, 'Chat not found', 404);
  }
  
  return success(res, { chat });
});

export const deleteChat = handleAsyncErrors(async (req, res) => {
  const { chatId } = req.params;
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return error(res, 'Session ID is required', 400);
  }
  
  const result = await Chat.deleteOne({
    _id: chatId,
    sessionId
  });
  
  if (result.deletedCount === 0) {
    return error(res, 'Chat not found', 404);
  }
  
  return success(res, { message: 'Chat deleted successfully' });
});