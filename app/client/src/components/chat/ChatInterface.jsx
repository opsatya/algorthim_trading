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

// Streaming Cursor Component
const StreamingCursor = () => (
  <span className="inline-block w-2 h-4 bg-violet-400 ml-1 animate-pulse rounded-sm"></span>
);

export const ChatInterface = ({ onStreamingChange, onDemoModeChange }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
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
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
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
          isError: true,
          id: Date.now().toString()
        }]);
      });

      newSocket.on('ai_response', (response) => {
        setIsLoading(false);
        
        // Simulate streaming for demo purposes if backend doesn't support it yet
        if (response.content && response.content.length > 20) {
          const simulateStreaming = async () => {
            const newMessage = { 
              text: '', 
              isUser: false,
              id: response.messageId || Date.now().toString()
            };
            setMessages(prev => [...prev, newMessage]);
            setStreamingMessage(newMessage);
            onStreamingChange?.(true);
            
            const words = response.content.split(' ');
            for (let i = 0; i < words.length; i++) {
              await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
              setStreamingMessage(prev => ({
                ...prev,
                text: words.slice(0, i + 1).join(' ')
              }));
              
              setMessages(prev => prev.map(msg => 
                msg.id === newMessage.id 
                  ? { ...msg, text: words.slice(0, i + 1).join(' ') }
                  : msg
              ));
            }
            
            setStreamingMessage(null);
            onStreamingChange?.(false);
          };
          
          simulateStreaming();
        } else {
          setMessages(prev => [...prev, { 
            text: response.content, 
            isUser: false,
            id: response.messageId || Date.now().toString()
          }]);
        }
      });

      // Handle streaming responses
      newSocket.on('ai_stream_start', (response) => {
        setIsLoading(false);
        const newMessage = { 
          text: '', 
          isUser: false,
          id: response.messageId || Date.now().toString()
        };
        setMessages(prev => [...prev, newMessage]);
        setStreamingMessage(newMessage);
        onStreamingChange?.(true);
      });

      newSocket.on('ai_stream_chunk', (chunk) => {
        if (streamingMessage) {
          setStreamingMessage(prev => ({
            ...prev,
            text: (prev?.text || '') + chunk.content
          }));
          
          // Update the message in the messages array
          setMessages(prev => prev.map(msg => 
            msg.id === streamingMessage.id 
              ? { ...msg, text: (msg.text || '') + chunk.content }
              : msg
          ));
        }
      });

      newSocket.on('ai_stream_end', (response) => {
        setStreamingMessage(null);
        onStreamingChange?.(false);
      });

      newSocket.on('ai_error', (error) => {
        console.error('❌ AI service error:', error);
        setIsLoading(false);
        setMessages(prev => [...prev, { 
          text: error.message || "AI service unavailable", 
          isUser: false,
          isError: true,
          id: Date.now().toString()
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
    if (!input.trim()) return;

    // Demo mode - simulate AI response
    if (demoMode) {
      const userMessage = { text: input, isUser: true, id: Date.now().toString() };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      
      // Simulate AI thinking
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      
      // Generate demo response
      const demoResponses = [
        "Based on my analysis of the current market conditions, I can see several interesting patterns emerging. The volatility index suggests increased market uncertainty, while sector rotation indicates a shift towards defensive stocks. Let me break this down further...",
        "I've analyzed the technical indicators and fundamental data for this request. The moving averages show a bullish trend, but there are some concerning signals in the RSI and MACD indicators. Here's what I found...",
        "This is an excellent question about market dynamics. Let me provide you with a comprehensive analysis based on current economic indicators, sector performance, and historical patterns. The data suggests..."
      ];
      
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      // Simulate streaming
      const newMessage = { 
        text: '', 
        isUser: false,
        id: Date.now().toString()
      };
      setMessages(prev => [...prev, newMessage]);
      setStreamingMessage(newMessage);
      onStreamingChange?.(true);
      
      const words = randomResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        setStreamingMessage(prev => ({
          ...prev,
          text: words.slice(0, i + 1).join(' ')
        }));
        
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, text: words.slice(0, i + 1).join(' ') }
            : msg
        ));
      }
      
      setStreamingMessage(null);
      onStreamingChange?.(false);
      return;
    }

    // Real backend mode
    if (!socket) return;

    // Check if backend is available
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      setMessages(prev => [...prev, { 
        text: "⚠️ Cannot send message: Backend server is not available. Please ensure the Node.js server is running on port 5000.", 
        isUser: false,
        isError: true,
        id: Date.now().toString()
      }]);
      return;
    }

    const userMessage = { text: input, isUser: true, id: Date.now().toString() };
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
        isError: true,
        id: Date.now().toString()
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
        {demoMode ? (
          <>
            <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
            <span className="text-violet-400">Demo Mode Active</span>
          </>
        ) : (
          <>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span>
              {connectionStatus === 'connected' ? 'Connected to AI' : 
               connectionStatus === 'error' ? 'Backend Offline' : 'Connecting...'}
            </span>
          </>
        )}
      </div>
      
      {/* Streaming Status */}
      {streamingMessage && (
        <div className="flex items-center gap-2 text-sm text-violet-400">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
          <span>AI is responding...</span>
        </div>
      )}
      
      {/* Demo Mode Toggle */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => {
            const newDemoMode = !demoMode;
            setDemoMode(newDemoMode);
            onDemoModeChange?.(newDemoMode);
          }}
          className={`px-3 py-1 rounded-lg text-xs transition-colors ${
            demoMode 
              ? 'bg-violet-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {demoMode ? 'Demo Mode ON' : 'Demo Mode OFF'}
        </button>
        {demoMode && (
          <span className="text-xs text-violet-400">Try typing anything to see streaming!</span>
        )}
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
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-violet-500/20 border-b border-violet-500/30 px-4 py-2 text-center">
          <span className="text-violet-300 text-sm font-medium">
            🎭 Demo Mode Active - Try typing anything to see streaming in action!
          </span>
        </div>
      )}
      
      <div className="h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div className="flex items-start gap-3">
                    {!msg.isUser && (
                      <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl transition-all duration-200 ${
                        msg.isUser 
                          ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10 rounded-br-none ml-auto" 
                          : msg.isError 
                            ? "bg-red-500/20 border border-red-500/50" 
                                                          : streamingMessage && streamingMessage.id === msg.id
                                ? "bg-white/10 backdrop-blur-sm rounded-bl-none border border-violet-500/30 shadow-lg shadow-violet-500/20"
                                : "bg-white/5 backdrop-blur-sm rounded-bl-none"
                      }`}
                    >
                      {formatResponse(msg.text)}
                      {/* Streaming indicator */}
                      {streamingMessage && streamingMessage.id === msg.id && <StreamingCursor />}
                    </div>
                    
                    {msg.isUser && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && !streamingMessage && <TypingIndicator />}
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
              placeholder={demoMode ? "Try typing anything in demo mode..." : "Ask anything about trading..."}
              disabled={isLoading || (!demoMode && connectionStatus !== 'connected')}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || (!demoMode && connectionStatus !== 'connected')}
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
