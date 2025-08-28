import { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
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
    <span className="text-gray-400 text-sm">AI is analyzing...</span>
  </div>
);

export const ChatInterface = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  
  // Generate unique session ID for this chat session
  const sessionId = user?.id || `session_${Date.now()}`;

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
            <div key={`code-${lineIndex}`} className="font-mono bg-black/30 p-4 rounded-lg my-2 block">
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
          <div key={`table-${lineIndex}`} className="overflow-x-auto bg-black/20 p-2 rounded-lg my-2 block">
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

  // WebSocket setup
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        path: '/socket.io',
        transports: ['websocket'],
        query: { sessionId }
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to backend WebSocket');
        setConnectionStatus('connected');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from backend:', reason);
        setConnectionStatus('disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Backend connection error:', error);
        setConnectionStatus('error');
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
        console.error('❌ AI service error:', error);
        setIsLoading(false);
        setMessages(prev => [...prev, { 
          text: error.message || "AI service unavailable", 
          isUser: false,
          isError: true
        }]);
      });

      setSocket(newSocket);
      
      return () => {
        newSocket.close();
      };
    }
  }, [user, sessionId]);

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
    if (!input.trim() || !socket) return;

    // Check if backend is available
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      setMessages(prev => [...prev, { 
        text: "⚠️ Cannot send message: Backend server is not available. Please ensure the Node.js server is running on port 5000.", 
        isUser: false,
        isError: true
      }]);
      return;
    }

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      socket.emit('user_message', {
        content: input,
        sessionId: sessionId
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, { 
        text: "Failed to send message: " + error.message, 
        isUser: false,
        isError: true
      }]);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-400">
      <Bot className="w-12 h-12 text-violet-500" />
      <h3 className="text-xl font-semibold text-white">
        Hello, {user?.firstName || 'Trader'}! 👋
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
          {connectionStatus === 'connected' ? 'Connected to AI' : 
           connectionStatus === 'error' ? 'Backend Offline' : 'Connecting...'}
        </span>
      </div>
      
      {/* Sample Questions */}
      <div className="mt-6 space-y-2 text-sm">
        <p className="text-gray-500">Try asking:</p>
        <div className="space-y-1">
          <button 
            onClick={() => setInput("Analyze ITC Limited")}
            className="block text-left text-violet-400 hover:text-violet-300 transition-colors"
          >
            • "Analyze ITC Limited"
          </button>
          <button 
            onClick={() => setInput("What are the current market trends?")}
            className="block text-left text-violet-400 hover:text-violet-300 transition-colors"
          >
            • "What are the current market trends?"
          </button>
          <button 
            onClick={() => setInput("Place buy order for 10 shares of ITC")}
            className="block text-left text-violet-400 hover:text-violet-300 transition-colors"
          >
            • "Place buy order for 10 shares of ITC"
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
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div className="flex items-start gap-3">
                    {!msg.isUser && (
                      <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.isUser 
                          ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10 rounded-br-none ml-auto" 
                          : msg.isError 
                            ? "bg-red-500/20 border border-red-500/50" 
                            : "bg-white/5 backdrop-blur-sm rounded-bl-none"
                      }`}
                    >
                      {formatResponse(msg.text)}
                    </div>
                    
                    {msg.isUser && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
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
              placeholder="Ask anything about trading..."
              disabled={isLoading || connectionStatus !== 'connected'}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || connectionStatus !== 'connected'}
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
