import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/ChatInterface.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ChatInterface() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const messagesEndRef = useRef(null);

  // ✅ Check authentication on initial render (client only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        router.push('/login');
      } else {
        setToken(storedToken);
        setAuthChecked(true);
      }
    }
  }, []);

  // ✅ Helper: Get or create session ID safely
  const getOrCreateSessionId = () => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    }
    return null;
  };

  // ✅ Load message history on initial render
  useEffect(() => {
    const loadHistory = async () => {
      const sessionId = getOrCreateSessionId();
      if (!sessionId) return;

      try {
        const response = await fetch(`${API_BASE}/api/chat/history/${sessionId}`);
        const data = await response.json();
        setMessages(data.messages);
      } catch (err) {
        console.error('Error loading history:', err);
      }
    };

    if (typeof window !== 'undefined') {
      loadHistory();
    }
  }, []);

  // ✅ Auto-scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    let sessionId = null;
    if (typeof window !== 'undefined') {
      sessionId = localStorage.getItem('sessionId') || '64a1d4f6b1fcd75f3c1e0aab';
    }

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...(prev || []), userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionid': sessionId || '',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        text: data.message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...(prev || []), aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: 'Sorry, something went wrong. Please try again later.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

// ✅ Handle new chat creation
  const handleNewChat = () => {
  // Optional: Create a new sessionId
  if (typeof window !== 'undefined') {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', newSessionId);
  }

  // Reset state
  setMessages([]);
  setInput('');

  // Optional: Add a welcome message
  const welcomeMessage = {
    id: Date.now(),
    text: 'New chat started. How can I help you?',
    sender: 'ai',
    timestamp: new Date().toISOString(),
  };
  setMessages([welcomeMessage]);
};

  // ✅ Prevent rendering until auth check is done
  if (!authChecked) return null;

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        <div className={styles.messagesContainer}>
          {messages?.map((msg) => (
            <div
              key={msg._id || msg.id}
              className={`${styles.message} ${
                msg.sender === 'user' ? styles.userMessage : styles.aiMessage
              }`}
            >
              <div className={styles.messageContent}>{msg.text}</div>
              <div className={styles.messageTimestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className={styles.messageInput}
          />
          <button type="submit" className={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
