// pages/chat.js
import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import ChatInterface from '../components/ChatInterface';

export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', newSessionId);
    window.location.href = `/chat?sessionId=${newSessionId}`;
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
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
      <ChatInterface />
    </>
  );
}