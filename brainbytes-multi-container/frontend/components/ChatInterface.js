import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'; // ✅ Import router
import styles from '../styles/ChatInterface.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://hostname:4000';

export default function ChatInterface() {
  const router = useRouter(); // ✅ Initialize router

  // ✅ Redirect unauthenticated users
  const [authChecked, setAuthChecked] = useState(false); // 👈 State to track if auth check is done
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const messagesEndRef = useRef(null);

  // ✅ Check authentication on initial render
  useEffect(() => {
  const storedToken = localStorage.getItem('token');
  if (!storedToken) {
    router.push('/login');
  } else {
    setToken(storedToken);
    setAuthChecked(true); // Allow rendering of chat interface
  }
}, []);


  // ✅ Helper: Get or create session ID
  const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // ✅ Load message history on initial render
  useEffect(() => {
    const loadHistory = async () => {
      const sessionId = getOrCreateSessionId();
      try {
        const response = await fetch(`${API_BASE}/api/chat/history/${sessionId}`);
        const data = await response.json();
        setMessages(data.messages);
      } catch (err) {
        console.error('Error loading history:', err);
      }
    };

    loadHistory();
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

    // Generate a valid MongoDB ObjectId-like fallback if needed
    const sessionId = localStorage.getItem('sessionId') || '64a1d4f6b1fcd75f3c1e0aab';
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionid': sessionId,
          'Authorization': `Bearer ${token}`, // ✅ Include token for authentication
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

      setMessages((prev) => [...prev, aiMessage]);
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

  // ✅ Ensure auth check is done before rendering
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
