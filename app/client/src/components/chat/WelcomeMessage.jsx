import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const WelcomeMessage = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const fullMessage = user 
    ? "Your personal AI trading assistant is ready to help"
    : "Please sign in to start trading with AI assistance";

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    };
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedMessage(fullMessage.slice(0, index + 1));
      index++;
      if (index === fullMessage.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [fullMessage]);

  return (
    <div className="text-center space-y-3 mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
        {greeting}, {user ? user.username : 'Trader'}
      </h1>
      <p className="text-gray-400">{typedMessage}</p>
    </div>
  );
};