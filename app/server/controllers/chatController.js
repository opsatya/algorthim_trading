import Chat from '../models/chat.js';
import { handleAsyncErrors } from '../middlewares/error.js';
import { success, error } from '../utils/responseHandler.js';

export const createChat = handleAsyncErrors(async (req, res) => {
  const newChat = await Chat.create({
    userId: req.user._id,
    messages: req.body.initialMessage ? [
      { content: req.body.initialMessage, sender: 'user' }
    ] : []
  });
  
  return success(res, { chat: newChat }, 201);
});

export const getChats = handleAsyncErrors(async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id })
    .select('_id title lastUpdated')
    .sort({ lastUpdated: -1 });
  
  return success(res, { chats });
});

export const getChatById = handleAsyncErrors(async (req, res) => {
  const chat = await Chat.findOne({
    _id: req.params.chatId,
    userId: req.user._id
  });
  
  if (!chat) {
    return error(res, 'Chat not found', 404);
  }
  
  return success(res, { chat });
});

export const addMessage = handleAsyncErrors(async (req, res) => {
  const { chatId } = req.params;
  const { content, sender } = req.body;
  
  if (!content || !sender) {
    return error(res, 'Content and sender are required', 400);
  }
  
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId: req.user._id },
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
  const { title } = req.body;
  
  if (!title) {
    return error(res, 'Title is required', 400);
  }
  
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId: req.user._id },
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
  
  const result = await Chat.deleteOne({
    _id: chatId,
    userId: req.user._id
  });
  
  if (result.deletedCount === 0) {
    return error(res, 'Chat not found', 404);
  }
  
  return success(res, { message: 'Chat deleted successfully' });
});