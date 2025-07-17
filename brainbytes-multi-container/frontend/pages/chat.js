// pages/chat.js
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import ChatInterface from '../components/ChatInterface';

export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatResetKey, setChatResetKey] = useState(0); // force re-mount ChatInterface

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionId');
    localStorage.setItem('isAuthenticated', 'false');
    window.location.href = '/login';
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', newSessionId);
    setChatResetKey(prev => prev + 1); // force re-render of ChatInterface
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <>
      <NavBar
        onLogout={handleLogout}
        onNewChat={handleNewChat}
        onDashboard={handleDashboard}
      />
      <ChatInterface key={chatResetKey} onNewChat={handleNewChat} />
    </>
  );
}