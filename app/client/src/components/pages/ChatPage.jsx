import { ChatHeader } from "../chat/ChatHeader";
import { WelcomeMessage } from "../chat/WelcomeMessage";
import { ChatInterface } from "../chat/ChatInterface";
import { useAuth } from "../hooks/useAuth"; // Import authentication
import  Sidebar from "../pages/Sidebar"
import   TrendingNews from "../pages/TrendingNews"

const ChatPage = () => {
  const { user } = useAuth(); // Get authenticated user

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 animate-gradient">
      <ChatHeader />
      <main className="pt-24 px-4 pb-8">
        <WelcomeMessage username={user ? user.username : "Guest"} />
        <ChatInterface />
        <Sidebar />
        <TrendingNews />
      </main>
    </div>
  );
};

export default ChatPage;
