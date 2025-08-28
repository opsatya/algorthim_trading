import { History, Bell, Settings } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

export const ChatHeader = ({ isStreaming = false, isDemoMode = false }) => {
  return (
    <div className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Cancerian Capital
            </span>
            {isDemoMode && (
              <div className="flex items-center gap-2 text-sm text-violet-400">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Demo Mode</span>
              </div>
            )}
            {isStreaming && (
              <div className="flex items-center gap-2 text-sm text-violet-400">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                <span>AI responding...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <History className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            
            {/* Clerk User Button */}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-black/90 border border-white/10",
                  userButtonPopoverActionButton: "text-white hover:bg-white/10"
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};