import { History, User, Settings, Bell, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export const ChatHeader = () => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    // Optional: Redirect to landing page
    window.location.href = '/';
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  return (
    <div className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Cancerian capital
            </span>
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
            {user ? (
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            ) : (
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <User className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 p-6 rounded-2xl border border-white/10 w-full max-w-sm mx-auto">
            <h3 className="text-xl font-medium text-white mb-4">Confirm Logout</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-4 justify-end w-full">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};