# Backend Server - Clean Architecture

This backend server acts as a bridge between the frontend and Flask AI server, handling chat functionality and WebSocket communication.

## Architecture Flow

```
Frontend → Backend (Node.js) → Flask Server (AI) → Backend → Frontend
```

1. **Frontend** sends user message via WebSocket to Backend
2. **Backend** forwards message to Flask Server via WebSocket
3. **Flask Server** processes with AI and returns response
4. **Backend** receives response and forwards to Frontend
5. **Chat history** is stored in MongoDB for persistence

## Features

- ✅ WebSocket communication with frontend
- ✅ WebSocket bridge to Flask AI server
- ✅ Chat history storage in MongoDB
- ✅ Session-based chat management (no user authentication)
- ✅ Health check endpoints
- ✅ Clean, minimal codebase

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```env
# Backend Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB Connection (for chat history)
MONGODB_URI=mongodb://localhost:27017/algorthmic_trading

# Flask Server Configuration (WebSocket)
FLASK_WS_URL=http://127.0.0.1:5001
```

3. **Start the server:**
```bash
npm run dev    # Development mode
npm start      # Production mode
```

## API Endpoints

### Health & Status
- `GET /api/health` - Server health check
- `GET /api/system/flask-status` - Flask connection status

### Chat Management
- `POST /api/chat/chats` - Create new chat
- `GET /api/chat/chats` - Get chats for session
- `GET /api/chat/chats/:chatId` - Get specific chat
- `POST /api/chat/chats/:chatId/messages` - Add message to chat
- `PUT /api/chat/chats/:chatId/title` - Update chat title
- `DELETE /api/chat/chats/:chatId` - Delete chat
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/message` - Send message (placeholder)

## WebSocket Events

### Frontend → Backend
- `user_message` - User sends message

### Backend → Frontend
- `ai_response` - AI response from Flask
- `ai_error` - Error response
- `service_status` - Flask service status

## Database Models

### Chat
- `sessionId` - Unique session identifier
- `title` - Chat title
- `messages` - Array of message objects
- `lastUpdated` - Last activity timestamp
- `createdAt` - Creation timestamp

### ChatMessage
- `sessionId` - Session identifier
- `content` - Message content
- `isUserMessage` - Boolean flag
- `createdAt` - Creation timestamp

## Notes

- **No Authentication**: Uses session-based identification for simplicity
- **Flask Integration**: Connects to Flask server at `127.0.0.1:5001`
- **MongoDB**: Only used for chat history storage
- **WebSocket**: Primary communication method for real-time chat
- **Session Management**: Frontend should generate and manage session IDs

## Dependencies

- `express` - Web framework
- `socket.io` - WebSocket server
- `socket.io-client` - WebSocket client (for Flask)
- `mongoose` - MongoDB ODM
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
