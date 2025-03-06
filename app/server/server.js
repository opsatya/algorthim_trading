import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ClientIO } from "socket.io-client";
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import newsRoutes from './routes/newsRoutes.js';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const server = createServer(app);

// Configure Socket.IO server
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true,
    methods: ["GET", "POST"]
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  }
});

// Flask WebSocket configuration
let flaskSocket = null;
const connectToFlask = () => {
  flaskSocket = ClientIO("http://127.0.0.1:5001", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    transports: ['websocket']
  });

  // Event handlers
  flaskSocket.on("connect", () => {
    console.log("✅ Connected to Flask WebSocket");
    io.emit('service_status', { ai: true });
  });

  flaskSocket.on("disconnect", (reason) => {
    console.log(`❌ Flask WebSocket disconnected: ${reason}`);
    io.emit('service_status', { ai: false });
    if (reason === 'io server disconnect') {
      flaskSocket.connect();
    }
  });

  flaskSocket.on("connect_error", (error) => {
    console.error("Flask connection error:", error.message);
  });

  flaskSocket.on("message_response", (response) => {
    // Sanitize response content if it exists and is a string
    if (response?.content && typeof response.content === 'string') {
      // Remove ANSI escape codes
      response.content = response.content.replace(/\u001b\[\d+m/g, '');
      
      // Option 1: Convert ASCII tables and markdown to HTML (if frontend supports HTML)
      // This can be expanded based on your specific formatting needs
      response.contentType = 'formatted';
    }

    // Forward AI responses to appropriate clients
    if (response?.correlation_id) {
      // Ensure we're using the right property name for correlation ID
      const correlationId = response.correlation_id;
      io.to(correlationId).emit('ai_response', {
        correlationId: correlationId,  // Standardize property name for frontend
        content: response.content,
        contentType: response.contentType || 'text',
        status: response.status || 'success',
        error: response.error,
        timestamp: response.timestamp || Date.now()
      });
    } else {
      console.warn("Received message response without correlation ID:", response);
    }
  });
};

// Initial Flask connection
connectToFlask();

// Express middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);

// WebSocket communication handler
io.on("connection", (socket) => {
  console.log(`🔌 Frontend connected: ${socket.id}`);
  
  // Message handling
  socket.on("user_message", async (data) => {
    try {
      console.log("Express -> Flask:", data.content);
      const correlationId = socket.id + Date.now();
      
      // Format message data to match what Flask expects
      const messageData = {
        correlation_id: correlationId,  // Use underscore format for Flask
        content: data.content,
        metadata: {
          userId: socket.userId,
          sessionId: socket.id
        }
      };
      
      // Store message in room for correlation
      socket.join(correlationId);
      
      if (flaskSocket?.connected) {
        // Set response timeout
        const timeout = setTimeout(() => {
          socket.emit('ai_error', {
            correlationId: correlationId,  // Use camelCase for frontend
            message: "AI response timeout",
            code: 504
          });
          socket.leave(correlationId);
        }, 15000);

        // Setup once-only response listener for this specific message
        const responseHandler = (response) => {
          // Check both possible formats for correlation ID
          const receivedId = response.correlation_id || response.correlationId;
          if (receivedId === correlationId) {
            clearTimeout(timeout);
            socket.leave(correlationId);
            flaskSocket.off("message_response", responseHandler);
          }
        };
        
        flaskSocket.on("message_response", responseHandler);

        // Forward to Flask with the event name Flask expects
        flaskSocket.emit("process_message", messageData);
      } else {
        socket.emit('ai_error', {
          correlationId: correlationId,
          message: "AI service unavailable",
          code: 503
        });
      }
    } catch (error) {
      console.error("Message handling error:", error);
      socket.emit('ai_error', {
        correlationId: data?.correlationId || 'unknown',
        message: "Message processing failed",
        code: 500
      });
    }
  });

  // Authentication middleware
  socket.use(([event, data], next) => {
    if (event === 'auth') {
      try {
        const token = data?.token;
        if (token) {
          jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
              socket.userId = decoded.userId;
              next();
            } else {
              socket.emit('auth_error', 'Invalid token');
            }
          });
        } else {
          socket.emit('auth_error', 'Missing authentication token');
        }
      } catch (error) {
        socket.emit('auth_error', 'Authentication failed');
      }
    } else {
      next();
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 Frontend disconnected (${reason}): ${socket.id}`);
  });
});

// Debug endpoint to check Flask connection status
app.get('/api/system/flask-status', (req, res) => {
  res.json({
    connected: flaskSocket?.connected || false,
    reconnecting: flaskSocket?.reconnecting || false,
    lastPing: flaskSocket?._lastPing || null
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
});