import { useState, useEffect, useRef } from "react";
import { Send, Bot, Lock } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Button from "../ui/Button";
import axiosInstance from '../utils/axiosConfig';
import { io } from "socket.io-client";

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="flex items-center space-x-2 p-4 bg-gray-800 rounded-2xl max-w-[85%]">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
           style={{animationDelay: '0.2s'}}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
           style={{animationDelay: '0.4s'}}></div>
    </div>
    <span className="text-gray-400 text-sm">Analyzing...</span>
  </div>
);

export const ChatInterface = ({ openAuthModal }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  
  const fullPlaceholder = isAuthenticated 
    ? "Ask anything about trading..." 
    : "Sign in to start chatting...";
    
  const messageStyles = {
    user: "bg-gradient-to-r from-blue-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10 rounded-br-none ml-auto",
    bot: "bg-white/5 backdrop-blur-sm rounded-bl-none",
    code: "font-mono bg-black/30 p-4 rounded-lg my-2 block",
    table: "overflow-x-auto bg-black/20 p-2 rounded-lg my-2 block"
  };

  // Format message content with code and table detection
  const formatResponse = (text) => {
    if (typeof text !== 'string') return <p>Invalid message format</p>;
    
    const lines = text.split('\n');
    const formattedContent = [];
    let codeBlockOpen = false;
    let codeContent = [];
    
    lines.forEach((line, lineIndex) => {
      // Detect code blocks with ```
      if (line.trim().startsWith('```')) {
        if (!codeBlockOpen) {
          codeBlockOpen = true;
          codeContent = [];
        } else {
          // Close code block
          formattedContent.push(
            <div key={`code-${lineIndex}`} className={messageStyles.code}>
              <pre className="whitespace-pre-wrap text-sm">
                {codeContent.join('\n')}
              </pre>
            </div>
          );
          codeBlockOpen = false;
        }
        return;
      }
      
      if (codeBlockOpen) {
        codeContent.push(line);
        return;
      }
      
      // Detect tables (simple ASCII table detection)
      if (line.includes('|') && (line.includes('-|-') || lines[lineIndex + 1]?.includes('-|-'))) {
        formattedContent.push(
          <div key={`table-${lineIndex}`} className={messageStyles.table}>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {line}
            </pre>
          </div>
        );
        return;
      }
      
      // Detect inline code with backticks
      if (line.includes('`')) {
        const parts = line.split('`');
        const formattedLine = [];
        
        parts.forEach((part, i) => {
          if (i % 2 === 0) {
            formattedLine.push(part);
          } else {
            formattedLine.push(
              <code key={`inline-${i}`} className="px-1 py-0.5 bg-black/30 rounded font-mono text-sm">
                {part}
              </code>
            );
          }
        });
        
        formattedContent.push(<p key={`line-${lineIndex}`} className="mb-2 last:mb-0">{formattedLine}</p>);
        return;
      }
      
      // Regular text
      formattedContent.push(<p key={`line-${lineIndex}`} className="mb-2 last:mb-0">{line}</p>);
    });
    
    return formattedContent;
  };

  // Fetch chat history when user is authenticated
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (isAuthenticated && user) {
        try {
          // Try to get Firebase ID token for authentication
          const token = await user.getIdToken();
          
          const endpoint = chatId 
            ? `/chat/chats/${chatId}`
            : '/chat/history';
          
          const response = await axiosInstance.get(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setMessages(response.data.chats || []);
          if (response.data.chatId) {
            setChatId(response.data.chatId);
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
          // Don't automatically open auth modal, user might not have backend running
        }
      }
    };
    
    fetchChatHistory();
  }, [isAuthenticated, user, chatId]);

  // WebSocket setup with better error handling
  useEffect(() => {
    if (isAuthenticated && user) {
      const connectWebSocket = async () => {
        try {
          const token = await user.getIdToken();
          
          const newSocket = io('http://localhost:5000', {
            path: '/socket.io',
            transports: ['websocket'],
            query: { token }
          });

          newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setConnectionStatus('connected');
          });

          newSocket.on('disconnect', (reason) => {
            console.log('Disconnected from WebSocket server:', reason);
            setConnectionStatus('disconnected');
          });

          newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setConnectionStatus('error');
            // Add a user-friendly message
            setMessages(prev => [...prev, { 
              text: "⚠️ Backend server is not running. Please start the Node.js server on port 5000.", 
              isUser: false,
              isError: true
            }]);
          });

          newSocket.on('ai_response', (response) => {
            setIsLoading(false);
            setMessages(prev => [...prev, { 
              text: response.content, 
              isUser: false 
            }]);
          });

          newSocket.on('ai_error', (error) => {
            console.error('AI service error:', error);
            setIsLoading(false);
            setMessages(prev => [...prev, { 
              text: error.message || "AI service unavailable", 
              isUser: false,
              isError: true
            }]);
          });

          setSocket(newSocket);
          return () => newSocket.close();
          
        } catch (error) {
          console.error('Error setting up WebSocket:', error);
          setConnectionStatus('error');
        }
      };
      
      connectWebSocket();
    }
  }, [isAuthenticated, user]);

  // Animate placeholder text
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedPlaceholder(fullPlaceholder.slice(0, index + 1));
      index++;
      if (index === fullPlaceholder.length) clearInterval(interval);
    }, 50); // Faster typing animation
    return () => clearInterval(interval);
  }, [fullPlaceholder]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!isAuthenticated || !user) {
      openAuthModal('login');
      return;
    }
  
    if (!input.trim()) return;

    // Check if backend is available
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      setMessages(prev => [...prev, { 
        text: "⚠️ Cannot send message: Backend server is not available. Please ensure the Node.js server is running on port 5000.", 
        isUser: false,
        isError: true
      }]);
      return;
    }

    if (socket) {
      const userMessage = { text: input, isUser: true };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        socket.emit('user_message', {
          content: input,
          chatId: chatId,
          userId: user.uid // Use Firebase UID
        });
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
        setMessages(prev => [...prev, { 
          text: "Failed to send message: " + error.message, 
          isUser: false,
          isError: true
        }]);
      }
    }
  };

  // Show loading spinner while Firebase auth is initializing
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        <div className="h-[600px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </div>
    );
  }

  const UnauthorizedState = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-400">
      <Lock className="w-12 h-12 text-violet-500" />
      <h3 className="text-xl font-semibold text-white">Welcome to AI Trading Assistant</h3>
      <p className="text-center max-w-md">
        Sign in to access personalized trading insights, market analysis, and AI-powered investment recommendations.
      </p>
      
      {/* Single Login Button */}
      <Button
        onClick={() => openAuthModal('login')}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:opacity-90 transition-all transform hover:scale-105 font-semibold"
      >
        🚀 Sign In to Get Started
      </Button>
      
      {/* Features Preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <Bot className="w-6 h-6 text-violet-400 mx-auto mb-2" />
          <p>AI Market Analysis</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <span className="text-2xl block mb-2">📊</span>
          <p>Real-time Data</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <span className="text-2xl block mb-2">💡</span>
          <p>Smart Insights</p>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-400">
      <Bot className="w-12 h-12 text-violet-500" />
      <h3 className="text-xl font-semibold text-white">
        Hello, {user?.displayName || user?.email?.split('@')[0]}! 👋
      </h3>
      <p className="text-center max-w-md">
        I'm your AI trading assistant. Ask me about market trends, stock analysis, or investment strategies.
      </p>
      
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' : 
          connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`}></div>
        <span>
          {connectionStatus === 'connected' ? 'Connected' : 
           connectionStatus === 'error' ? 'Backend Offline' : 'Connecting...'}
        </span>
      </div>
      
      {/* Sample Questions */}
      <div className="mt-6 space-y-2 text-sm">
        <p className="text-gray-500">Try asking:</p>
        <div className="space-y-1">
          <button 
            onClick={() => setInput("What are the top trending stocks today?")}
            className="block text-left text-violet-400 hover:text-violet-300 transition-colors"
          >
            • "What are the top trending stocks today?"
          </button>
          <button 
            onClick={() => setInput("Analyze Tesla's recent performance")}
            className="block text-left text-violet-400 hover:text-violet-300 transition-colors"
          >
            • "Analyze Tesla's recent performance"
          </button>
          <button 
            onClick={() => setInput("Should I invest in tech stocks right now?")}
            className="block text-left text-violet-400 hover:text-violet-300 transition-colors"
          >
            • "Should I invest in tech stocks right now?"
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isAuthenticated ? (
            <UnauthorizedState />
          ) : messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.isUser ? messageStyles.user : 
                      msg.isError ? "bg-red-500/20 border border-red-500/50" : messageStyles.bot
                    }`}
                  >
                    {formatResponse(msg.text)}
                  </div>
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              <div 
                ref={messagesEndRef}
                className="h-px invisible" 
                aria-hidden="true"
              />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={typedPlaceholder}
              disabled={!isAuthenticated || isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!isAuthenticated || isLoading || !input.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
