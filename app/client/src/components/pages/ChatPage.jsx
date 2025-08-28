import { ChatHeader } from "../chat/ChatHeader";
import { ChatInterface } from "../chat/ChatInterface";
import { useUser } from "@clerk/clerk-react";

const ChatPage = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 animate-gradient">
      <ChatHeader />
      <main className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <ChatInterface />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Welcome, {user?.firstName || 'Trader'}!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get AI-powered insights for your trading decisions.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Ask about stock analysis</p>
                  <p>• Get market insights</p>
                  <p>• Place trading orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
