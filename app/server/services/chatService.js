import Chat from '../models/Chat.js';

// Get a user's recent chats
export const getRecentChats = async (userId, limit = 10) => {
  return Chat.find({ userId })
    .select('_id title lastUpdated')
    .sort({ lastUpdated: -1 })
    .limit(limit);
};

// Generate a title for a chat based on its first message
export const generateChatTitle = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat || chat.messages.length === 0) return;
  
  // Take the first user message and create a title
  const firstMessage = chat.messages.find(m => m.sender === 'user');
  if (!firstMessage) return;
  
  // Create a title from the first ~30 characters
  const title = firstMessage.content.substring(0, 30);
  const finalTitle = title.length < firstMessage.content.length
    ? `${title}...`
    : title;
  
  // Update the chat with the new title
  await Chat.updateOne(
    { _id: chatId },
    { $set: { title: finalTitle } }
  );
  
  return finalTitle;
};