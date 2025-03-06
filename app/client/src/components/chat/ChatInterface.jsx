import { useState, useEffect, useRef } from "react";
import { Send, Bot, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
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

export const ChatInterface = () => {
  const { user, setIsAuthModalOpen, setAuthMode } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);
  
  const fullPlaceholder = user 
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
    // Check if text is a string
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

  useEffect(() => {
    // Get chat history from API when user logs in
    const fetchChatHistory = async () => {
      if (user) {
        try {
          // If no chatId, fetch from general endpoint
          const endpoint = chatId 
            ? `/chat/chats/${chatId}`
            : '/chat/history';
          
          const response = await axiosInstance.get(endpoint, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          setMessages(response.data.chats || []);
          // Optionally set chatId if returned from API
          if (response.data.chatId) {
            setChatId(response.data.chatId);
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
          if (error.response && error.response.status === 401) {
            setIsAuthModalOpen(true);
            setAuthMode('login');
          }
        }
      }
    };
    
    fetchChatHistory();
  }, [user, chatId, setIsAuthModalOpen, setAuthMode]);

  // WebSocket setup
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', { // Connect to Express server
        path: '/socket.io',
        transports: ['websocket'],
        query: {
          token: user.token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      newSocket.on('ai_response', (response) => {
        setIsLoading(false);
        setMessages(prev => [...prev, { 
          text: response.content, 
          isUser: false 
        }]);
        
        // For streaming effect (uncomment to enable)
        // let currentText = '';
        // const words = response.content.split(' ');
        // const interval = setInterval(() => {
        //   if(words.length === 0) {
        //     clearInterval(interval);
        //     return;
        //   }
        //   currentText += words.shift() + ' ';
        //   setStreamingText(currentText);
        // }, 50);
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        setIsLoading(false);
        setMessages(prev => [...prev, { 
          text: error.message || "AI service unavailable", 
          isUser: false 
        }]);
      });

      newSocket.on('message_response', (response) => {
        if (response.status === 'success') {
          // Handle successful response
        } else {
          // Handle error
        }
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  useEffect(() => {
    // Animate placeholder text
    let index = 0;
    const interval = setInterval(() => {
      setTypedPlaceholder(fullPlaceholder.slice(0, index + 1));
      index++;
      if (index === fullPlaceholder.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [fullPlaceholder]);

  useEffect(() => {
    // Enhanced scroll behavior
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  }, [messages, isLoading]); // Add isLoading as dependency

  const handleSend = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      setAuthMode('login');
      return;
    }
  
    if (input.trim() && socket) {
      console.log("Frontend -> Express:", input);
      const userMessage = { text: input, isUser: true };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Send message via WebSocket
        socket.emit('user_message', {
          content: input,
          chatId: chatId,
          userId: user._id
        });
      } catch (error) {
        console.error('Error sending message:', error);
        setIsLoading(false);
        setMessages(prev => [...prev, { 
          text: error.message || "Connection error", 
          isUser: false 
        }]);
      }
    }
  };

  const UnauthorizedState = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-400">
      <Lock className="w-12 h-12 text-violet-500" />
      <p>Please sign in to start chatting with your AI trading assistant</p>
      <div className="flex gap-4">
        <Button
          onClick={() => { 
            setAuthMode("login"); 
            setIsAuthModalOpen(true); 
          }}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:opacity-90 transition-opacity"
        >
          Sign In
        </Button>
        <Button
          onClick={() => { 
            setAuthMode("signup"); 
            setIsAuthModalOpen(true);
          }}
          variant="secondary"
        >
          Sign Up
        </Button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-400">
      <Bot className="w-12 h-12 text-violet-500" />
      <p>Start a conversation with your AI trading assistant</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!user ? (
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
                      msg.isUser ? messageStyles.user : messageStyles.bot
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
              disabled={!user || isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!user || isLoading || !input.trim()}
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