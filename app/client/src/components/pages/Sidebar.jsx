import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiPlus, 
  FiMessageSquare, 
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        setChats([]);
        setLoading(false);
        return;
      }
  
      try {
        const response = await axiosInstance.get('/chat/chats', {
          headers: { 
            'Authorization': `Bearer ${user.token}` 
          }
        });
        // Adjust based on your API response structure
        setChats(response.data.chats || []); 
      } catch (err) {
        console.error('Failed to fetch chats:', err);
        
        // Handle unauthorized error
        if (err.response && err.response.status === 401) {
          // Optional: Clear user and redirect to login
          // You might want to add a method in your AuthContext to handle this
          setChats([]);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchChats();
  }, [user]);
  
  const startNewChat = async () => {
    if (!user) return;
  
    try {
      const response = await axiosInstance.post('/chat/new', null, {
        headers: { 
          'Authorization': `Bearer ${user.token}` 
        }
      });
      navigate(`/chat/${response.data.chat._id}`);
    } catch (err) {
      console.error('Failed to create new chat:', err);
      
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        // Redirect to login or show login modal
        setIsAuthModalOpen(true);
        setAuthMode('login');
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 z-40 backdrop-blur-md bg-black/20 border-r border-white/10">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              {user ? `Hi, ${user.username || 'User'}` : 'Cancerian Capital'}
            </span>
            <button 
              onClick={startNewChat}
              disabled={!user}
              className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              aria-label="Start new chat"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!user ? (
            <div className="text-gray-400 text-center py-4">
              Sign in to view chat history
            </div>
          ) : loading ? (
            <div className="text-gray-400 text-center py-4">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              No recent chats
            </div>
          ) : (
            chats.map((chat, index) => (
              <Link 
                key={index}
                to={`/chat/${chat._id}`}
                className="block p-3 hover:bg-white/5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FiMessageSquare className="text-gray-400 w-5 h-5" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm text-white truncate">
                      {chat.title || 'Untitled Chat'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* User Actions */}
        <div className="p-4 border-t border-white/10">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm text-white">{user.username || 'User'}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              Please sign in
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;